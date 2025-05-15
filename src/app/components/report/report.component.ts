import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent {
  reportType: string = '';
  description: string = '';
  userRole: 'LEARNER' | 'INSTRUCTOR';

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

  constructor(public authService: AuthService) {}

  ngOnInit() {
    this.authService.fetchUserData().subscribe({
      next: (user) => {
        this.userRole = user?.role;
        const reportMap =
          this.userRole === 'LEARNER'
            ? this.instructorReportMap
            : this.learnerReportMap;

        this.filteredReportTypes = Object.entries(reportMap).map(
          ([key, label]) => ({
            key,
            label,
          })
        );
      },
      error: (err) => {
        console.error('Failed to load user data:', err);
      },
    });
  }
  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Submitted', {
        reportType: this.reportType,
        description: this.description,
      });
    }

    // I will wait till I can get a clear way to access them maybe via back-end...
    // now we will make an API call
    // The configuration is clear
    // withCredentials: true
    // Path: http://localhost:8080/api/reports/create-report/{relatedSessionId}/{reportedUserId}
    // method POST
    // for now userId can be got via authService.
  }
}
