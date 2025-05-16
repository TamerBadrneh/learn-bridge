// src/app/components/pending-reports/pending-reports.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface Report {
  reportId: number;
  relatedSessionId: number;
  reportStatus: string;
  reportedById: number;
  reportedUserId: number;
  description: string;
  reportDate: string;
  reportType: string;
}

@Component({
  selector: 'app-pending-reports',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './pendingreports.component.html',
  styleUrls: ['./pendingreports.component.scss'],
})
export class PendingReportsComponent implements OnInit {
  reports: Report[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReports();
  }

  private loadReports(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http
      .get<Report[]>(`${this.baseUrl}/reports/pending-reports`, { withCredentials: true })
      .pipe(
        catchError(err => {
          console.error('Error loading pending reports', err);
          this.errorMessage = 'Could not load pending reports.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(data => {
        this.reports = data;
        this.isLoading = false;
      });
  }

  onRefund(sessionId: number): void {
    this.http
      .post(`${this.baseUrl}/payments/refund/${sessionId}`, {}, { withCredentials: true })
      .pipe(
        catchError(err => {
          console.error('Refund failed', err);
          alert('Refund failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onTransfer(sessionId: number): void {
    this.http
      .post(`${this.baseUrl}/payments/transfer/${sessionId}`, {}, { withCredentials: true })
      .pipe(
        catchError(err => {
          console.error('Transfer failed', err);
          alert('Transfer failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onDelete(reportId: number): void {
    this.http
      .delete(`${this.baseUrl}/reports/${reportId}`, { withCredentials: true })
      .pipe(
        catchError(err => {
          console.error('Delete failed', err);
          alert('Delete failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onBlock(userId: number): void {
    this.http
      .post(`${this.baseUrl}/admin/block-user/${userId}`, {}, { withCredentials: true })
      .pipe(
        catchError(err => {
          console.error('Block failed', err);
          alert('Block failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }
}
