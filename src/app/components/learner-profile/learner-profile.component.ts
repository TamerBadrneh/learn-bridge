import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-learner-profile',
  templateUrl: './learner-profile.component.html',
  styleUrls: ['./learner-profile.component.scss'],
})
export class LearnerProfile {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    favouriteCategory: '',
  };

  constructor(private http: HttpClient) {}

  hasPasswordMismatch(): any {
    return (
      this.formData.password &&
      this.formData.confirmPassword &&
      this.formData.password !== this.formData.confirmPassword
    );
  }

  async submitForm() {
    if (this.hasPasswordMismatch()) return;

    const data = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      password: this.formData.password,
      favouriteCategory: this.formData.favouriteCategory,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    try {
      await this.http
        .put('http://localhost:8080/api/personal-info/edit-info', data, {
          headers,
          withCredentials: true,
        })
        .toPromise();
    } catch (error) {
      console.error('Profile update failed', error);
    }
  }
}
