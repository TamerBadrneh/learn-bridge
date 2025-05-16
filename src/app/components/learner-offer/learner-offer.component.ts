import { Component } from '@angular/core';
import { LearnerOfferService } from '../../shared/services/learner-offer.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-learner-offer',
  templateUrl: './learner-offer.component.html',
  styleUrl: './learner-offer.component.scss',
})
export class LearnerOfferComponent {
  offerInfo: any;

  constructor(
    private learnerOfferService: LearnerOfferService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.offerInfo = this.learnerOfferService.getOfferInfo();

    this.authService.fetchUserData().subscribe({
      next: (user) => {
        console.log('User data loaded:', user);
      },
      error: (err) => {
        console.error('Failed to load user data', err);
      },
    });
  }

  handleReject(): void {
    if (confirm('Are you sure you want to reject this request?')) {
      const id = this.offerInfo.notificationId;
      this.http
        .post(
          `http://localhost:8080/api/agreements/notifications/${id}/reject-learner-request`,
          {},
          { withCredentials: true }
        )
        .subscribe({
          next: () => {
            alert('Request rejected successfully.');
            window.location.href = '/instructor/home';
          },
          error: (err) => console.error('Reject error:', err),
        });
    }
  }

  handleAccept(): void {
    if (confirm('Do you want to accept this learning request?')) {
      const id = this.offerInfo.notificationId;
      this.http
        .post(
          `http://localhost:8080/api/agreements/notifications/${id}/accept-learner-request`,
          {},
          { withCredentials: true }
        )
        .subscribe({
          next: () => {
            alert('Request accepted successfully.');
            window.location.href = '/instructor/chat';
          },
          error: (err) => console.error('Accept error:', err),
        });
    }
  }
}
