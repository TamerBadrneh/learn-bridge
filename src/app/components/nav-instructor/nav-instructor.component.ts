import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LearnerOfferService } from '../../shared/services/learner-offer.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
    private learnerOfferService: LearnerOfferService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.http
      .get<any[]>(
        'https://learn-bridge-back-end.onrender.com/api/agreements/notifications',
        {
          withCredentials: true,
        }
      )
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
          `https://learn-bridge-back-end.onrender.com/api/notifications/${notification.notificationId}/read`,
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

    if (notification.notificationType === 'AGREEMENT') {
      const id = notification.notificationId;
      this.http
        .get(
          `https://learn-bridge-back-end.onrender.com/api/agreements/${id}/info`,
          {
            withCredentials: true,
          }
        )
        .subscribe({
          next: (res) => {
            this.learnerOfferService.setOfferInfo(res, id);
            this.router.navigate(['/instructor/learner-offer']);
          },
          error: (err) => {
            console.error('Error fetching learner offer info', err);
          },
        });
    } else if (notification.notificationType === 'POST')
      this.router.navigate(['/instructor/posts']);
    else if (notification.notificationType === 'TRANSACTION')
      this.router.navigate(['/instructor/payment']);
  }

  openSignOutModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  logoutUser() {
    this._AuthService.logout();
  }
}
