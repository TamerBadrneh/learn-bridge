// src/app/components/learner-profile/learner-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface PersonalInfo {
  userRole: string;
  firstName: string;
  lastName: string;
  email: string;
  favouriteCategory: string;
}

@Component({
  standalone: true,
  selector: 'app-learner-profile',
  templateUrl: './learner-profile.component.html',
  styleUrls: ['./learner-profile.component.scss'],
  imports: [
    CommonModule,    // for *ngIf, *ngFor, etc.
    FormsModule      // for ngModel, ngForm export
  ]
})
export class LearnerProfileComponent implements OnInit {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    favouriteCategory: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<PersonalInfo>(
        'http://localhost:8080/api/personal-info/get-personal-info',
        { withCredentials: true }
      )
      .subscribe({
        next: info => {
          this.formData.firstName = info.firstName;
          this.formData.lastName  = info.lastName;
          this.formData.email     = info.email;
          this.formData.favouriteCategory = info.favouriteCategory;
        },
        error: err => console.error('Failed to load profile', err)
      });
  }

  hasPasswordMismatch(): boolean {
    return !!(
      this.formData.password &&
      this.formData.confirmPassword &&
      this.formData.password !== this.formData.confirmPassword
    );
  }

  async submitForm(form: NgForm) {
    if (form.invalid || this.hasPasswordMismatch()) return;

    const payload = {
      firstName: this.formData.firstName,
      lastName:  this.formData.lastName,
      email:     this.formData.email,
      password:  this.formData.password,
      favouriteCategory: this.formData.favouriteCategory
    };

    try {
      await this.http
        .put(
          'http://localhost:8080/api/personal-info/edit-info',
          payload,
          {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          }
        )
        .toPromise();
      alert('Your information was successfully updated!');
    } catch (error) {
      console.error('Profile update failed', error);
    }
  }
}
