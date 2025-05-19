import { Component } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-nav-admin',
  standalone: false,
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss',
})
export class AdminNavComponent {
  constructor(
    private _AuthService: AuthService,
    private modalService: NgbModal
  ) {}
  openSignOutModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  logoutUser() {
    this._AuthService.logout();
  }
}
