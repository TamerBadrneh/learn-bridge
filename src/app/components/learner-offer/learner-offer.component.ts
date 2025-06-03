import { Component } from '@angular/core';
import { LearnerOfferService } from '../../shared/services/learner-offer.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

// Documented By Tamer

@Component({
  standalone: false,
  selector: 'app-learner-offer',
  templateUrl: './learner-offer.component.html',
  styleUrl: './learner-offer.component.scss',
})
export class LearnerOfferComponent {
  // Members
  offerInfo: any;

  // Constructor
  constructor(
    private learnerOfferService: LearnerOfferService,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * Retrieves the offer information using the learner offer service and assigns
   * it to the `offerInfo` property. Fetches user data from the authentication
   * service and logs the data or an error message to the console.
   */
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

  /**
   * Rejects the learner's request. If the user confirms, it sends an HTTP POST
   * request to the server to reject the learner's request. If the request is
   * successful, it shows an alert with a success message and navigates back to
   * the instructor's homepage. If the request fails, it shows an error message
   * in the console.
   */
  handleReject(): void {
    if (confirm('Are you sure you want to reject this request?')) {
      const id = this.offerInfo.notificationId;
      this.http
        .post(
          `https://learn-bridge-back-end.onrender.com/api/agreements/notifications/${id}/reject-learner-request`,
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

  /**
   * Accepts the learner's request. If the user confirms, it sends an HTTP POST
   * request to the server to accept the learner's request. If the request is
   * successful, it shows an alert with a success message and navigates to the
   * instructor's chat page. If the request fails, it shows an error message in
   * the console.
   */
  handleAccept(): void {
    if (confirm('Do you want to accept this learning request?')) {
      const id = this.offerInfo.notificationId;
      this.http
        .post(
          `https://learn-bridge-back-end.onrender.com/api/agreements/notifications/${id}/accept-learner-request`,
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
