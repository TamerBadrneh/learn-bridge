// src/app/components/agreement/agreement.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.scss'],
})
export class AgreementComponent implements OnInit {
  info: AskForAgreementInfo | null = null;
  loading = false;
  error: string | null = null;

  private notificationId!: number;
  private baseUrl = 'http://localhost:8080/api/agreements';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['notificationId'];
      if (!id) {
        this.error = 'No notification specified.';
        return;
      }
      this.notificationId = +id;
      this.fetchInfo();
    });
  }

  private fetchInfo(): void {
    this.loading = true;
    this.http
      .get<AskForAgreementInfo>(
        `${this.baseUrl}/${this.notificationId}/info`,
        { withCredentials: true }
      )
      .subscribe({
        next: data => {
          this.info = data;
          this.loading = false;
        },
        error: err => {
          console.error('Error fetching agreement info', err);
          this.error = 'Failed to load agreement details.';
          this.loading = false;
        }
      });
  }

  acceptAgreement(): void {
    if (!this.info) {
      return;
    }
    this.loading = true;
    this.http
      .post<SessionDTO>(
        `${this.baseUrl}/notifications/${this.notificationId}/accept`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: (session: SessionDTO) => {
          this.router.navigate(['/learner/payment'], {
            queryParams: { sessionId: session.sessionId }
          });
        },
        error: err => {
          console.error('Error accepting agreement', err);
          this.error = 'Could not accept the offer. You might have insufficient funds.';
          this.loading = false;
        }
      });
  }

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
          this.router.navigate(['/learner/home']);
        },
        error: err => {
          console.error('Error rejecting agreement', err);
          this.error = 'Could not reject the offer.';
          this.loading = false;
        }
      });
  }
}
