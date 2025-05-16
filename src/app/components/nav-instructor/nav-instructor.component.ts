import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LearnerOfferService } from '../../shared/services/learner-offer.service';

@Component({
  selector: 'app-nav-instructor',
  standalone: false,
  templateUrl: './nav-instructor.component.html',
  styleUrl: './nav-instructor.component.scss',
})
export class NavInstructorComponent {
  notifications: any[] = [];
  hasUnread = false;

  constructor(
    private _AuthService: AuthService,
    private http: HttpClient,
    private router: Router,
    private learnerOfferService: LearnerOfferService
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.http
      .get<any[]>('http://localhost:8080/api/agreements/notifications', {
        withCredentials: true,
      })
      .subscribe((data) => {
        this.notifications = data || [];
        this.hasUnread = this.notifications.some(
          (n) => n.readStatus === 'UNREAD'
        );
      });
  }

  handleNotificationClick(notification: any) {
    if (notification.readStatus === 'UNREAD') {
      this.http
        .put(
          `http://localhost:8080/api/notifications/${notification.notificationId}/read`,
          {},
          { withCredentials: true }
        )
        .subscribe(() => {
          notification.readStatus = 'READ';
          this.hasUnread = this.notifications.some(
            (n) => n.readStatus === 'UNREAD'
          );
        });
    }

    const message: string = notification.message;
    const isLearnerOffer = message.includes('requested your tutoring services');

    if (isLearnerOffer) {
      const id = notification.notificationId;
      this.http
        .get(`http://localhost:8080/api/agreements/${id}/info`, {
          withCredentials: true,
        })
        .subscribe({
          next: (res) => {
            console.log('Learner offer info:', res);
            this.learnerOfferService.setOfferInfo(res, id);
            this.router.navigate(['/instructor/learner-offer']);
          },
          error: (err) => {
            console.error('Error fetching learner offer info', err);
          },
        });
    }
  }

  logoutUser() {
    this._AuthService.logout();
  }
}
