import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Documented By Tamer

// Interface Type definition
interface AskForAgreementInfo {
  agreementId: number;
  instructorId: number;
  learnerId: number;
  postId: number | null;
  sessionsNumber: number;
  ratingsNumber: number;
  averageRating: number;
  category: string;
  subject: string;
  description: string;
  learnerName: string;
  instructorName: string;
  instructorBio: string;
  price: number;
}

interface SessionDTO {
  sessionId: number;
  instructorId: number;
  agreementId: number;
  sessionStatus: string;
}

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.scss'],
})
export class AgreementComponent implements OnInit {
  // Members
  info: AskForAgreementInfo | null = null;
  loading = false;
  error: string | null = null;
  private notificationId!: number;
  private baseUrl = 'http://localhost:8080/api/agreements';

  // Constructor
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Initialize the component.
   * Fetches the agreement info from the backend when the component is initialized.
   * If no notificationId is specified in the route, an error is set.
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['notificationId'];
      if (!id) {
        this.error = 'No notification specified.';
        return;
      }
      this.notificationId = +id;
      this.fetchInfo();
    });
  }

  /**
   * Fetches agreement information from the backend using the current notification ID.
   * Sets loading state to true while the request is in progress.
   * On success, populates the `info` field with the retrieved data and sets loading to false.
   * On error, logs the error to the console, sets an error message, and sets loading to false.
   * The request is made with credentials for authentication.
   */

  private fetchInfo(): void {
    this.loading = true;
    this.http
      .get<AskForAgreementInfo>(`${this.baseUrl}/${this.notificationId}/info`, {
        withCredentials: true,
      })
      .subscribe({
        next: (data) => {
          this.info = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching agreement info', err);
          this.error = 'Failed to load agreement details.';
          this.loading = false;
        },
      });
  }

  /**
   * Accepts the agreement with the given notification ID.
   * If the agreement ID is not set, does nothing.
   * Sets loading state to true while the request is in progress.
   * On success, redirects the user to the learner chat page with the session ID as a query parameter.
   * On error, logs the error to the console, sets an error message, and sets loading to false.
   * The request is made with credentials for authentication.
   */
  acceptAgreement(): void {
    if (!this.info) return;
    this.loading = true;

    this.http
      .post<SessionDTO>(
        `${this.baseUrl}/notifications/${this.notificationId}/accept`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: (session: SessionDTO) => {
          const url = this.router
            .createUrlTree(['/learner/chat'], {
              queryParams: { sessionId: session.sessionId },
            })
            .toString();

          window.location.href = url;
        },
        error: (err) => {
          console.error('Error accepting agreement', err);
          this.error =
            'Could not accept the offer. You might have insufficient funds.';
          this.loading = false;
        },
      });
  }

  /**
   * Rejects the agreement with the given notification ID.
   * If the agreement ID is not set, does nothing.
   * Sets loading state to true while the request is in progress.
   * On success, redirects the user to the learner home page.
   * On error, logs the error to the console, sets an error message, and sets loading to false.
   * The request is made with credentials for authentication.
   */
  rejectAgreement(): void {
    this.loading = true;

    this.http
      .post<void>(
        `${this.baseUrl}/notifications/${this.notificationId}/reject`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          window.location.href = this.router
            .createUrlTree(['/learner/home'])
            .toString();
        },
        error: (err) => {
          console.error('Error rejecting agreement', err);
          this.error = 'Could not reject the offer.';
          this.loading = false;
        },
      });
  }
}
