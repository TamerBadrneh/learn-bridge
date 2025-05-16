import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  reportId: number;
  relatedSessionId: number;
  reportStatus: string;
  reportedById: number;
  reportedUserId: number;
  description: string;
  reportDate: string; 
  reportType: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ✅ Get pending reports
  getPendingReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/reports/pending-reports`, {
      withCredentials: true,
    });
  }

  // Refund money API call
  refundMoney(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/refund/${sessionId}`, {}, {
      withCredentials: true,
    });
  }

  // Transfer money API call
  transferMoney(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/transfer/${sessionId}`, {}, {
      withCredentials: true,
    });
  }

  // Delete report API call
  deleteReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/reports/${reportId}`, {
      withCredentials: true,
    });
  }

  // Block reported user API call
  blockUser(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/block-user/${userId}`, {}, {
      withCredentials: true,
    });
  }
}
