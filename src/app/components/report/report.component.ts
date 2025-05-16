import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { ReportService } from './Report Service.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {
  reportType: string = '';
  description: string = '';
  userRole: 'LEARNER' | 'INSTRUCTOR' = 'LEARNER'; // default fallback
  chatId: number | null = null;

  instructorReportMap: { [key: string]: string } = {
    INSTRUCTOR_INAPPROPRIATE_BEHAVIOR: 'Instructor behaved inappropriately',
    INSTRUCTOR_UNRESPONSIVE: 'Instructor did not respond to messages',
    INSTRUCTOR_POOR_TEACHING_QUALITY: 'Instructor’s teaching was poor',
    INSTRUCTOR_MISLEADING_INFORMATION:
      'Instructor provided misleading information',
    INSTRUCTOR_OTHER: 'Other',
  };

  learnerReportMap: { [key: string]: string } = {
    LEARNER_NON_PAYMENT: 'Learner did not complete payment',
    LEARNER_NO_SHOW: 'Learner did not attend the session',
    LEARNER_DISRUPTIVE_BEHAVIOR: 'Learner was disruptive during the session',
    LEARNER_INAPPROPRIATE_BEHAVIOR: 'Learner behaved inappropriately',
    LEARNER_OTHER: 'Other',
  };

  filteredReportTypes: { key: string; label: string }[] = [];

  constructor(
    public authService: AuthService,
    private reportService: ReportService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.chatId = this.reportService.getChatId();

    this.authService.fetchUserData().subscribe({
      next: (user) => {
        this.userRole = user?.role || 'LEARNER';
        const reportMap =
          this.userRole === 'LEARNER'
            ? this.instructorReportMap
            : this.learnerReportMap;

        this.filteredReportTypes = Object.entries(reportMap).map(
          ([key, label]) => ({ key, label })
        );
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
      },
    });
  }

  onSubmit(form: NgForm) {
    if (form.valid && this.chatId) {
      const body = {
        reportType: this.reportType,
        description: this.description,
      };

      const confirmResult = confirm(`Do you want to report this User ?`);
      if (!confirmResult) return;

      this.http
        .post(
          `http://localhost:8080/api/reports/create-report/${this.chatId}`,
          body,
          { withCredentials: true }
        )
        .subscribe({
          next: () => {
            alert('Report submitted successfully.');
            this.router.navigate([`${this.userRole.toLowerCase()}/home`]);
          },
          error: (err) => {
            console.error('Failed to submit report:', err);
            alert('Failed to submit report.');
          },
        });
    } else {
      console.warn('Form is invalid or chatId is missing');
    }
  }
}
