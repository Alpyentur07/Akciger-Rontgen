from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import transforms
from transformers import BeitForImageClassification
from PIL import Image
import os
import io
import base64
import sys
import traceback
import requests

app = Flask(__name__)
CORS(app)

# Paths
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "Model", "akciger_model_refactored.pth")
print(f"Looking for model at: {MODEL_PATH}")
print(f"Model file exists: {os.path.exists(MODEL_PATH)}")

# Class names (must match those used during training)
CLASS_NAMES = ["covid", "normal", "pneumonia", "tuberculosis"]

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Initialize transforms - must match training transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Load model
def load_model():
    try:
        print("Initializing model...")
        model = BeitForImageClassification.from_pretrained(
            'microsoft/beit-base-patch16-224-pt22k-ft22k',
            num_labels=len(CLASS_NAMES),
            ignore_mismatched_sizes=True
        )
        print("Model initialized, loading weights...")
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("Weights loaded successfully")
        model.to(device)
        model.eval()
        return model
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        traceback.print_exc()
        return None

# Load model on startup
model = load_model()
if model is None:
    print("Failed to load model. Exiting...")
    sys.exit(1)

print(f"Model loaded successfully from: {MODEL_PATH}")
print(f"Running on device: {device}")

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'image' not in request.json:
        return jsonify({'error': 'Lütfen bir resim verisi sağlayınız.'}), 400

    try:
        # Decode base64 image
        image_data = request.json['image'].split(',')[1] if ',' in request.json['image'] else request.json['image']
        image_bytes = base64.b64decode(image_data)

        # 1. Gemini API ile kontrol
        gemini_api_key = "AIzaSyBImJeLsgl-F-LzM7lar2wdcKMZqWep5Lo"
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_api_key}"
        gemini_headers = {'Content-Type': 'application/json'}
        gemini_payload = {
            "contents": [
                {
                    "parts": [
                        {"text": "Bu bir akciğer röntgeni mi? Sadece 'evet' veya 'hayır' olarak cevap ver. Açıklama yapma."},
                        {"inlineData": {"mimeType": "image/jpeg", "data": image_data}}
                    ]
                }
            ]
        }
        gemini_response = requests.post(gemini_url, headers=gemini_headers, json=gemini_payload, timeout=20)
        gemini_response.raise_for_status()
        gemini_result = gemini_response.json()
        gemini_text = gemini_result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '').strip().lower()
        if 'evet' not in gemini_text:
            return jsonify({'error': 'Lütfen bir akciğer röntgeni görüntüsü yükleyiniz.'}), 400

        # 2. Sınıflandırma
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)[0]
        results = {
            class_name: float(probabilities[i].item() * 100)
            for i, class_name in enumerate(CLASS_NAMES)
        }
        return jsonify({
            'success': True,
            'predictions': results
        })
    except requests.exceptions.RequestException as e:
        print(f"Gemini API hatası: {str(e)}")
        return jsonify({'error': 'Gemini API ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyiniz.'}), 500
    except Exception as e:
        print(f"Tahmin sırasında hata: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Bir hata oluştu. Lütfen tekrar deneyiniz.'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Server is running'}), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    app.run(debug=True, port=5000, host='0.0.0.0') 