import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import axios from 'axios';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage: string = '';
  signupSubmitted = false;

  constructor(
    private _FormBuilder: FormBuilder,
    private _AuthService: AuthService,
    private _Router: Router
  ) {}

  ngOnInit() {
    this.signupForm = this._FormBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        role: ['', [Validators.required]],
        favoriteCategories: ['', [Validators.required]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$'),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.mustMatch('password', 'confirmPassword'),
      }
    );

    this.signupForm.get('role')?.valueChanges.subscribe((role) => {
      console.log('Selected role:', role);
    });
  }

  // Custom validator to check if password and confirm password match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  // Helper methods to check field validity
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    if (field != null)
      return (
        field.invalid && (field.dirty || field.touched || this.signupSubmitted)
      );
    return false;
  }

  // Helper method to get appropriate error message for each field
  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (fieldName === 'firstName') {
      if (field.errors['required']) {
        return 'First name is required';
      }
      if (field.errors['minlength']) {
        return 'First name must be at least 2 characters';
      }
    }

    if (fieldName === 'lastName') {
      if (field.errors['required']) {
        return 'Last name is required';
      }
      if (field.errors['minlength']) {
        return 'Last name must be at least 2 characters';
      }
    }

    if (fieldName === 'email') {
      if (field.errors['required']) {
        return 'Email is required';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }

    if (fieldName === 'role') {
      if (field.errors['required']) {
        return 'Please select a role';
      }
    }

    if (fieldName === 'favoriteCategories') {
      if (field.errors['required']) {
        return 'Please select a category';
      }
    }

    if (fieldName === 'password') {
      if (field.errors['required']) {
        return 'Password is required';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters';
      }
      if (field.errors['pattern']) {
        return 'Password must contain at least one letter and one number';
      }
    }

    if (fieldName === 'confirmPassword') {
      if (field.errors['required']) {
        return 'Please confirm your password';
      }
      if (field.errors['mustMatch']) {
        return 'Passwords do not match';
      }
    }

    return '';
  }

  // Getter for easy access to form fields
  get sf() {
    return this.signupForm.controls;
  }

  onSignupSubmit() {
    this.signupSubmitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      firstName: this.signupForm.value.firstName,
      lastName: this.signupForm.value.lastName,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      role: this.signupForm.value.role,
      favouriteCategory: this.signupForm.value.favoriteCategories,
    };

    // We are storing the value for adding the card...
    // TODO: When Zaid finish, uncomment this
    // localStorage.setItem('isNewUser', 'true');

    if (userData.role === 'INSTRUCTOR') {
      localStorage.setItem('pendingInstructor', JSON.stringify(userData));
      this.isLoading = false;
      this._Router.navigate(['/instructor-bio']);
    } else {
      const formattedUserData = {
        ...userData,
        bio: '',
        avgPrice: 0,
        universityInfo: '',
      };

      // TODO: fix api call when deploy the project...
      axios
        .post('http://localhost:8080/api/register', formattedUserData)
        .then(() => {
          this.isLoading = false;
          this._Router.navigate(['/login']);
        })
        .catch((error) => {
          this.errorMessage =
            error.response?.data?.message ||
            'Registration failed. Please try again.';
          this.isLoading = false;
        });
    }
  }
}
