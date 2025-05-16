import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // ✅ Get pending reports
  getPendingReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.baseUrl}/reports/pending-reports`, {
      headers: this.getHeaders(),
    });
  }

  // ✅ Refund money API call
  refundMoney(sessionId: number): Observable<any> {
    // TODO: implement refund API logic here
    // Example endpoint (to be confirmed): /payments/refund/{sessionId}

    return this.http.post(`${this.baseUrl}/payments/refund/${sessionId}`, {}, {
      headers: this.getHeaders(),
    });
  }

  // ✅ Transfer money API call
  transferMoney(sessionId: number): Observable<any> {
    // TODO: implement transfer API logic here
    // Example: /payments/transfer/{sessionId}

    return this.http.post(`${this.baseUrl}/payments/transfer/${sessionId}`, {}, {
      headers: this.getHeaders(),
    });
  }

  // ✅ Delete report API call
  deleteReport(reportId: number): Observable<any> {
    // TODO: confirm endpoint for deleting a report

    return this.http.delete(`${this.baseUrl}/reports/${reportId}`, {
      headers: this.getHeaders(),
    });
  }

  // ✅ Block reported user API call
  blockUser(userId: number): Observable<any> {
    // TODO: implement block user logic
    // Example endpoint (to be confirmed): /admin/block-user/{userId}
    
    return this.http.post(`${this.baseUrl}/admin/block-user/${userId}`, {}, {
      headers: this.getHeaders(),
    });
  }
}
