import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: false,
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  constructor(private _Router: Router, private authService: AuthService) {}

  navigateToHome() {
    this._Router.navigate([
      `${this.authService.userData.role.toLowerCase() || ''}/home`,
    ]);
  }
}
