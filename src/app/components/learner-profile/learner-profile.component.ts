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

  firstNameError: string = '';
  lastNameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  favouriteCategoryError: string = '';

  constructor(private http: HttpClient) {}

  validateFirstName() {
    if (!this.formData.firstName.trim()) {
      this.firstNameError = 'First Name is required';
    } else {
      this.firstNameError = '';
    }
  }

  validateLastName() {
    if (!this.formData.lastName.trim()) {
      this.lastNameError = 'Last Name is required';
    } else {
      this.lastNameError = '';
    }
  }

  validateEmail() {
    if (!this.formData.email.trim()) {
      this.emailError = 'Email is required';
    } else if (!this.validateEmailFormat(this.formData.email)) {
      this.emailError = 'Please enter a valid email';
    } else {
      this.emailError = '';
    }
  }

  validatePassword() {
    if (!this.formData.password.trim()) {
      this.passwordError = 'Password is required';
    } else {
      this.passwordError = '';
    }
  }

  validateConfirmPassword() {
    if (this.formData.password !== this.formData.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
    } else {
      this.confirmPasswordError = '';
    }
  }

  validateCategory() {
    if (!this.formData.favouriteCategory) {
      this.favouriteCategoryError = 'Category selection is required';
    } else {
      this.favouriteCategoryError = '';
    }
  }

  isFormInvalid(): string {
    this.validateFirstName();
    this.validateLastName();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();
    this.validateCategory();
    return (
      this.firstNameError ||
      this.lastNameError ||
      this.emailError ||
      this.passwordError ||
      this.confirmPasswordError ||
      this.favouriteCategoryError
    );
  }

  private validateEmailFormat(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  }

  async submitForm() {
    if (this.isFormInvalid()) return;

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
