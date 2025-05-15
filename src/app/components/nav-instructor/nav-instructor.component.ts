import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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
    private router: Router
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

    if (notification.notificationType === 'AGREEMENT_REQUEST') {
      this.router.navigate(['/learner/agreement'], {
        queryParams: { notificationId: notification.notificationId },
      });
    }
  }

  logoutUser() {
    this._AuthService.logout();
  }
}
