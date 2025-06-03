import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  standalone: false,
  selector: 'app-nav-blank',
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss',
})
export class NavBlankComponent implements OnInit {
  notifications: any[] = [];
  hasUnread = false;

  constructor(
    private _AuthService: AuthService,
    private http: HttpClient,
    private router: Router,
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
          {
            withCredentials: true,
          }
        )
        .subscribe(() => {
          notification.readStatus = 'READ';
          this.hasUnread = this.notifications.some(
            (n) => n.readStatus === 'UNREAD'
          );
        });
    }

    // Types Are
    // TRANSACTION,
    // POST,
    // AGREEMENT,
    // OTHER

    if (notification.notificationType === 'AGREEMENT') {
      this.router.navigate(['/learner/agreement'], {
        queryParams: { notificationId: notification.notificationId },
      });
    } else if (notification.notificationType === 'POST') {
      this.router.navigate(['/learner/my-posts']);
    } else if (notification.notificationType === 'TRANSACTION') {
      this.router.navigate(['/learner/payment']);
    }

    // else no need to navigate...
  }

  // Modal Code
  openSignOutModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  logoutUser() {
    this._AuthService.logout();
  }
}
