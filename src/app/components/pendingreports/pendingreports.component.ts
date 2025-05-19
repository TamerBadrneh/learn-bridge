// src/app/components/pending-reports/pending-reports.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';

interface Report {
  reportId: number;
  relatedSessionId: number;
  reportStatus: string;
  reportedById: number;
  reportedUserId: number;
  description: string;
  reportDate: string;
  reportType: string;
  amount: number;
  currency: string;
  paymentDate: string;
}

@Component({
  selector: 'app-pending-reports',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pendingreports.component.html',
  styleUrls: ['./pendingreports.component.scss'],
})
export class PendingReportsComponent implements OnInit {
  reports: Report[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 3;
  totalPages = 1;
  private allReports: Report[] = [];

  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadReports();
  }

  private loadReports(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.http
      .get<Report[]>(`${this.baseUrl}/reports/pending-reports`, {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          console.error('Error loading pending reports', err);
          this.errorMessage = 'Could not load pending reports.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((data) => {
        this.allReports = data;
        this.totalPages = Math.ceil(data.length / this.pageSize);
        this.updateCurrentPageReports();
        this.isLoading = false;
      });
  }

  onRefund(reportId: number): void {
    this.http
      .post(
        `${this.baseUrl}/reports/refund/${reportId}`,
        {},
        { withCredentials: true }
      )
      .pipe(
        catchError((err) => {
          console.error('Refund failed', err);
          alert('Refund failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onTransfer(reportId: number): void {
    this.http
      .post(
        `${this.baseUrl}/reports/transfer/${reportId}`,
        {},
        { withCredentials: true }
      )
      .pipe(
        catchError((err) => {
          console.error('Transfer failed', err);
          alert('Transfer failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onDelete(reportId: number): void {
    this.http
      .delete(`${this.baseUrl}/reports/delete/${reportId}`, {
        withCredentials: true,
      })
      .pipe(
        catchError((err) => {
          console.error('Delete failed', err);
          alert('Delete failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onBlock(reportId: number): void {
    this.http
      .put(
        `${this.baseUrl}/reports/block/${reportId}`,
        {},
        { withCredentials: true }
      )
      .pipe(
        catchError((err) => {
          console.error('Block failed', err);
          alert('Block failed.');
          return of(null);
        })
      )
      .subscribe(() => this.loadReports());
  }

  onViewChat(relatedSessionId: number): void {
    this.router.navigate([`/admin/chat/${relatedSessionId}`]);
  }

  // for Pagination
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updateCurrentPageReports();
    }
  }

  private updateCurrentPageReports(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.reports = this.allReports.slice(startIndex, endIndex);
  }
}
