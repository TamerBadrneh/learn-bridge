import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-nav-instructor',
  standalone: false,
  templateUrl: './nav-instructor.component.html',
  styleUrl: './nav-instructor.component.scss'
})
export class NavInstructorComponent {
  constructor(private _AuthService: AuthService) {}
  
  logoutUser() {
    this._AuthService.logout();
  }
}