import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.scss'],
})
export class AgreementComponent implements OnInit {
  // instructor info
  instructorName = '';
  instructorBio = '';
  averageRating = 0;
  sessionsNumber = 0;
  ratingsNumber = 0;

  // post / learner info
  learnerName = '';
  postTitle = '';
  category = '';
  postDescription = '';
  price = 0;

  notificationId: number | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.notificationId = params['notificationId']
        ? +params['notificationId']
        : null;
      this.fetchAgreementInfo();
    });
  }

  private fetchAgreementInfo() {
    if (this.notificationId == null) {
      return;
    }

    this.http
      .get<AskForAgreementInfo>(
        `http://localhost:8080/api/agreements/${this.notificationId}/info`,
        { withCredentials: true }
      )
      .subscribe(
        (data) => {
          // Instructor side
          this.instructorName = data.instructorName;
          this.instructorBio = data.instructorBio;
          this.averageRating = data.averageRating;
          this.sessionsNumber = data.sessionsNumber;
          this.ratingsNumber = data.ratingsNumber;

          // Post / learner side
          this.learnerName = data.learnerName;
          this.postTitle = data.subject;
          this.category = data.category;
          this.postDescription = data.description;
          this.price = data.price;
        },
        (err) => {
          console.error('Error fetching agreement info', err);
        }
      );
  }

  acceptAgreement() {
    if (this.notificationId == null) {
      return;
    }

    this.http
      .post(
        `http://localhost:8080/api/agreements/notifications/${this.notificationId}/accept`,
        {},
        { withCredentials: true }
      )
      .subscribe(
        () => this.router.navigate(['/learner/payment']),
        (err) => console.error('Error accepting agreement', err)
      );
  }

  rejectAgreement() {
    if (this.notificationId == null) {
      return;
    }

    this.http
      .post(
        `http://localhost:8080/api/agreements/notifications/${this.notificationId}/reject`,
        {},
        { withCredentials: true }
      )
      .subscribe(
        () => this.router.navigate(['/learner/home']),
        (err) => console.error('Error rejecting agreement', err)
      );
  }
}
