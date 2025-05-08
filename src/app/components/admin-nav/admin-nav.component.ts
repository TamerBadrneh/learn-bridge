import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-nav-admin',
  standalone: false,
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss',
})
export class AdminNavComponent {
  constructor(private _AuthService: AuthService) {}
  logoutUser() {
    this._AuthService.logout();
  }
}
