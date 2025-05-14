import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginSubmitted = false;
  errorMessage: string = '';
  isLoading = false;
  showDebugLogs = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get formControls() {
    return this.loginForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return (
      !!field &&
      field.invalid &&
      (field.dirty || field.touched || this.loginSubmitted)
    );
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field) return '';

    if (fieldName === 'email') {
      if (field.errors?.['required']) return 'Email is required';
      if (field.errors?.['email']) return 'Invalid email format';
    }

    if (fieldName === 'password') {
      if (field.errors?.['required']) return 'Password is required';
      if (field.errors?.['minlength'])
        return 'Password must be at least 6 characters';
    }

    return '';
  }

  onLoginSubmit() {
    this.loginSubmitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.logDebug('Form is invalid');
      return;
    }

    this.isLoading = true;
    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.logDebug('Attempting login with:', credentials);

    this.authService.setLogin(credentials).subscribe({
      next: (loginResponse) => {
        this.logDebug('Login successful, response:', loginResponse);
        this.handleSuccessfulLogin();
      },
      error: (loginError: HttpErrorResponse) => {
        this.handleLoginError(loginError);
      },
    });
  }

  private handleSuccessfulLogin() {
    this.authService.fetchUserData().subscribe({
      next: (userData) => {
        this.logDebug('User data received:', userData);
        this.processUserData(userData);
      },
      error: (fetchError: HttpErrorResponse) => {
        this.handleUserDataError(fetchError);
      },
    });
  }

  private processUserData(userData: any) {
    this.isLoading = false;

    if (!userData?.role) {
      this.errorMessage = 'User role not found in response';
      this.logError('Invalid user data structure:', userData);
      return;
    }

    const normalizedRole = userData.role.toUpperCase();
    this.logDebug('Normalized user role:', normalizedRole);

    if (normalizedRole === 'ADMIN') {
      this.router.navigate(['/admin/home']);
      return;
    }

    fetch('http://localhost:8080/api/cards/has-card', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        this.logDebug('Card existence response:', data);

        if (data?.hasCard) {
          switch (normalizedRole) {
            case 'INSTRUCTOR':
              this.router.navigate(['/instructor/home']);
              break;
            case 'LEARNER':
              this.router.navigate(['/learner/home']);
              break;
            default:
              this.handleUnknownRole(normalizedRole);
          }
        } else {
          this.router.navigate(['/add-card']);
        }
      })
      .catch((error) => {
        this.logError('Error checking card existence:', error);
        this.errorMessage = 'Failed to verify card existence';
      });
  }

  private handleLoginError(error: HttpErrorResponse) {
    this.isLoading = false;
    this.logError('Login failed:', error);

    if (error.status === 0) {
      this.errorMessage = 'Network error - check your connection';
    } else if (error.status === 401) {
      this.errorMessage = 'Invalid email or password';
    } else {
      this.errorMessage =
        error.error?.error || 'Login failed. Please try again.';
    }
  }

  private handleUserDataError(error: HttpErrorResponse) {
    this.isLoading = false;
    this.logError('User data fetch failed:', error);

    this.errorMessage =
      error.status === 401
        ? 'Session expired - please login again'
        : 'Failed to load user profile';
  }

  private handleUnknownRole(role: string) {
    this.errorMessage = `Unrecognized user role: ${role}`;
    this.logError('Unknown role detected:', role);
    this.router.navigate(['/login']);
  }

  private logDebug(...args: any[]) {
    if (this.showDebugLogs) {
      console.log('[Login Debug]', ...args);
    }
  }

  private logError(...args: any[]) {
    console.error('[Login Error]', ...args);
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
