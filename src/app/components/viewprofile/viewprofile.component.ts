import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../../shared/services/auth.service';

interface InstructorProfile {
  instructorId: number;
  firstName: string;
  lastName: string;
  universityInfo: string;
  bio: string;
  avgPrice: number;
  favouriteCategory: string;
  numberOfSessions: number;
  numberOfReviews: number;
  ratingAvg: number;
  personalImage?: string;        // ← add this
}

interface ReviewSummary {
  reviewerName: string;
  stars: number;
  description: string;
}

@Component({
  selector: 'app-instructor-profile',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './viewprofile.component.html',
  styleUrls: ['./viewprofile.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ],
})
export class ViewProfileComponent implements OnInit {
  instructorId!: number;

  profile: InstructorProfile | null = null;
  loadingProfile = false;
  errorProfile: string | null = null;

  reviews: ReviewSummary[] = [];
  reviewsVisible = false;
  loadingReviews = false;
  errorReviews: string | null = null;

  userRole: string | null = null;
  sendingOffer = false;

  // Fallback placeholder image
  defaultPlaceholder =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

  private baseUrl = 'http://localhost:8080/api/instructors';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // get user role
    this.authService.fetchUserData().subscribe({
      next: user => this.userRole = user.role,
      error: err => {
        console.error('Failed to fetch user data', err);
        this.userRole = null;
      }
    });

    // grab :id from route and fetch
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.instructorId = +id;
        this.fetchProfile();
      } else {
        this.errorProfile = 'No instructor specified.';
      }
    });
  }

  makeOffer(): void {
    this.sendingOffer = true;
    const url = `${this.baseUrl}/request-instructor/${this.instructorId}`;
    this.http.post(url, {}, { withCredentials: true }).subscribe({
      next: () => {
        alert('Offer sent successfully.');
        this.sendingOffer = false;
      },
      error: err => {
        console.error('Error sending offer', err);
        alert('Failed to send offer.');
        this.sendingOffer = false;
      }
    });
  }

  private fetchProfile(): void {
    this.loadingProfile = true;
    this.errorProfile = null;

    this.http
      .get<InstructorProfile>(`${this.baseUrl}/profile/${this.instructorId}`, {
        withCredentials: true
      })
      .subscribe({
        next: data => {
          this.profile = data;
          this.loadingProfile = false;
        },
        error: err => {
          console.error('Error fetching profile', err);
          this.errorProfile = 'Failed to load instructor profile.';
          this.loadingProfile = false;
        }
      });
  }

  toggleReviews(): void {
    this.reviewsVisible = !this.reviewsVisible;
    if (this.reviewsVisible && this.reviews.length === 0) {
      this.fetchReviews();
    }
  }

  private fetchReviews(): void {
    this.loadingReviews = true;
    this.errorReviews = null;

    this.http
      .get<ReviewSummary[]>(
        `${this.baseUrl}/view-profile/${this.instructorId}/reviews`,
        { withCredentials: true }
      )
      .subscribe({
        next: data => {
          this.reviews = data;
          this.loadingReviews = false;
        },
        error: err => {
          console.error('Error fetching reviews', err);
          this.errorReviews = 'Failed to load reviews.';
          this.loadingReviews = false;
        }
      });
  }
}
