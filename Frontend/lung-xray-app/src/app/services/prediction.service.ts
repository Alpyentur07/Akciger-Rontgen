import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, retry, of, timeout } from 'rxjs';

export interface PredictionResult {
  success: boolean;
  predictions: {
    normal: number;
    covid: number;
    tuberculosis: number;
    pneumonia: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) { }

  predictImage(imageData: string): Observable<PredictionResult> {
    return this.http.post<PredictionResult>(`${this.apiUrl}/predict`, { image: imageData })
      .pipe(
        timeout(30000), // 30 seconds timeout
        retry(2), // Retry failed requests up to 2 times
        catchError(this.handleError)
      );
  }

  checkServerHealth(): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}/health`)
      .pipe(
        timeout(5000),
        catchError(() => of(false)),
        // Return true if the request succeeds
        retry(1)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.status === 0) {
      // A client-side or network error occurred
      errorMessage = 'Sunucu ile bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.';
      console.error('Server connection error:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      errorMessage = `Sunucu hatası (${error.status}): ${error.error?.error || error.message}`;
      console.error('Backend error:', error.error);
    }
    
    // Return an observable with a user-facing error message
    return throwError(() => new Error(errorMessage));
  }
}
