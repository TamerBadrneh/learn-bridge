import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-nav-blank',
  standalone: false,
  templateUrl: './nav-blank.component.html',
  styleUrl: './nav-blank.component.scss'
})
export class NavBlankComponent {


  constructor(private _AuthService: AuthService) {
    
  }
  logoutUser(){
    this._AuthService.logout()
  }
}
