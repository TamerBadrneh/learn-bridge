import { Component, OnInit } from '@angular/core';
import { ReportService, Report } from '../../shared/services/report.service';

@Component({
  selector: 'pending-reports',
  standalone: false,
  templateUrl: './pendingreports.component.html',
  styleUrl: './pendingreports.component.scss',
})
export class PendingReportsComponent implements OnInit {
  reports: Report[] = [];
  isLoading = false;

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.isLoading = true;
    this.reportService.getPendingReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reports:', err);
        this.isLoading = false;
      }
    });
  }

  onRefund(sessionId: number) {
  console.log('Refund clicked for session:', sessionId);
}

onTransfer(sessionId: number) {
  console.log('Transfer clicked for session:', sessionId);
}

onDelete(reportId: number) {
  console.log('Delete clicked for report:', reportId);
}

onBlock(userId: number) {
  console.log('Block clicked for user:', userId);
}


}