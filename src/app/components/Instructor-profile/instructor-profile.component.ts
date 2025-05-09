import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  standalone: false,
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss'],
})
export class InstructorProfile {
  form: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      favouriteCategory: ['', Validators.required],
      universityInfo: ['', Validators.required],
      bio: ['', Validators.required],
      avgPrice: ['', [Validators.required, Validators.min(1)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // TODO: Modify link for deployment phase...
    const payload = { ...this.form.value };
    this.http
      .put(
        'http://localhost:8080/api/personal-info/edit-info',
        JSON.stringify(payload),
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      .subscribe({
        next: () => alert('Your Information got successfully updated !'),
        error: (error) => console.error('Error:', error),
      });
  }
}
