# Akciğer Röntgen Sınıflandırma Projesi (BEiT Transformer Modeli)

Bu proje, akciğer röntgen (X-Ray) görüntülerinde çeşitli hastalıkları sınıflandırmak için **BEiT** (*Bidirectional Encoder representation from Image Transformers*) modeli kullanır.  
Proje, **Python/Flask backend** ve **React frontend** bileşenlerinden oluşmaktadır.

---

## 📌 Özellikler

- **Model:** BEiT Transformer ile ince ayarlanmış derin öğrenme modeli kullanılarak akciğer röntgen görüntülerinde aşağıdaki sınıflar tespit edilir:
  - Sağlıklı
  - COVID-19
  - Pnömoni
  - Tüberküloz
- **Backend (Flask):**
  - Yüklenen görüntünün geçerli bir akciğer röntgeni olup olmadığını doğrular.
  - Sınıflandırma işlemini yapar ve sonuçları **JSON formatında** döndürür.
- **Frontend (React):**
  - Kullanıcı dostu bir arayüz sağlar.
  - Görüntü yükleme ve sınıflandırma sonuçlarının görüntülenmesi.
  - **Chart.js** ile sınıflandırma olasılıklarının görselleştirilmesi.
  - Her hastalık sınıfı hakkında bilgilendirici içerik sunar.

---

## ⚙ Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

### 1️⃣ Depoyu Klonlayın
```bash
git clone https://github.com/Alpyentur07/Akciger-Rontgen.git
cd Akciger-Rontgen
```

### 2️⃣ Backend Kurulumu
```bash
cd backend
pip install -r requirements.txt
```
- **Model Ağırlıkları:** `lung_model.pth` dosyasının `backend` klasöründe bulunduğundan emin olun.
- **API Anahtarı (Opsiyonel):** Eğer görüntü doğrulaması için harici bir API kullanıyorsanız, `app.py` dosyasındaki `API_KEY` alanına kendi anahtarınızı ekleyin.

### 3️⃣ Frontend Kurulumu
```bash
cd ../frontend
npm install
```

---

## 🚀 Çalıştırma

### Backend'i Başlatın
```bash
cd backend
python app.py
```
Backend varsayılan olarak **http://localhost:5000** adresinde çalışır.

### Frontend'i Başlatın
```bash
cd frontend
npm start
```
Frontend varsayılan olarak **http://localhost:3000** adresinde çalışır.

Tarayıcıdan **http://localhost:3000** adresine giderek uygulamayı kullanabilirsiniz.

---

## 🖥 Kullanım

1. **"Röntgen Görüntüsü Yükle"** alanına bir akciğer röntgeni (.jpg, .png, .bmp, .tif) yükleyin.
2. **"Analizi Başlat"** butonuna tıklayın.
3. Sistem:
   - Görüntünün geçerli bir akciğer röntgeni olup olmadığını kontrol eder.
   - BEiT modeli ile sınıflandırma yapar.
4. Sonuçlar:
   - Hastalık sınıfı
   - Tahmin olasılıkları (grafik ile)
   - Hastalık hakkında kısa bilgi

⚠ **Önemli Not:** Bu uygulama yalnızca eğitim ve demo amaçlıdır. Tıbbi teşhis için kullanılmamalıdır. Her zaman bir sağlık uzmanına danışınız.

---

## 📊 Model Eğitimi

- Eğitim için `backend/ModelTrain.ipynb` dosyası kullanılabilir.
- Kullanılan veri seti: [Kaggle Chest X-Ray Dataset] veya benzeri açık kaynaklı veri setleri.
- Notebook, veri ön işleme, model tanımlama, eğitim süreci ve ağırlık kaydetme adımlarını içerir.

**Model Performansı (Örnek)**

| Epoch | Train Loss | Train Accuracy | Val Loss | Val Accuracy | F1 Score |
|-------|------------|----------------|----------|--------------|----------|
| 1     | ~0.45      | ~82%           | ~0.38    | ~85%         | ~0.84    |
| 2     | ~0.30      | ~90%           | ~0.26    | ~92%         | ~0.91    |
| 3     | ~0.20      | ~94%           | ~0.18    | ~95%         | ~0.95    |
| 4     | ~0.15      | ~96%           | ~0.15    | ~96.5%       | ~0.96    |
| 5     | ~0.10      | ~97%           | ~0.12    | ~97.5%       | ~0.97    |

---

## 📷 Ekran Görüntüleri

Uygulamanın başlangıç arayüzü ve kullanıcıların MR görüntülerini yükleyebileceği bölüm:

<img width="1583" height="847" alt="image" src="https://github.com/user-attachments/assets/f6b84102-5262-4086-8d87-945fedf5ae22" />

Analiz Sonuçları 
Yüklenen görüntünün analiz edilmesi sonucunda elde edilen Hastalık sınıflandırması, güven skoru, olasılık dağılımları

<img width="1432" height="802" alt="image" src="https://github.com/user-attachments/assets/0297c04c-112a-4ca8-98be-6e55d1a774e2" />




