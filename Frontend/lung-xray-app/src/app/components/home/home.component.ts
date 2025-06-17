import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService, PredictionResult } from '../../services/prediction.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  imagePreview: string | null = null;
  isLoading = false;
  error: string | null = null;
  result: PredictionResult | null = null;
  isServerAvailable = false;
  checkingServer = true;
  
  constructor(private predictionService: PredictionService) {}

  async ngOnInit() {
    await this.checkServerHealth();
  }

  async checkServerHealth() {
    this.checkingServer = true;
    try {
      this.isServerAvailable = await firstValueFrom(this.predictionService.checkServerHealth());
      if (!this.isServerAvailable) {
        this.error = 'Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.';
      }
    } catch (err) {
      this.isServerAvailable = false;
      this.error = 'Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.';
      console.error('Server health check failed:', err);
    } finally {
      this.checkingServer = false;
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (!inputElement.files || inputElement.files.length === 0) {
      this.error = 'Lütfen bir röntgen resmi seçiniz';
      return;
    }
    
    const file = inputElement.files[0];
    if (!file.type.includes('image')) {
      this.error = 'Lütfen geçerli bir resim dosyası seçiniz';
      return;
    }
    
    this.error = null;
    this.result = null;
    this.readFile(file);
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    if (!this.isServerAvailable) {
      await this.checkServerHealth();
      if (!this.isServerAvailable) {
        this.error = 'Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.';
        return;
      }
    }
    
    if (!this.imagePreview) {
      this.error = 'Lütfen bir röntgen resmi yükleyiniz';
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    this.predictionService.predictImage(this.imagePreview).subscribe({
      next: (result) => {
        this.result = result;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message || 'Bilinmeyen bir hata oluştu';
        this.isLoading = false;
      }
    });
  }

  getProgressBarClass(value: number): string {
    if (value > 70) return 'bg-success';
    if (value > 30) return 'bg-info';
    return 'bg-warning';
  }

  retry() {
    this.error = null;
    this.checkServerHealth();
  }
}
