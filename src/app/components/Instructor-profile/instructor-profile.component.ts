// src/app/components/instructor-profile/instructor-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface InstructorInfo {
  userRole: string;
  firstName: string;
  lastName: string;
  email: string;
  favouriteCategory: string;
  universityInfo: string;
  bio: string;
  avgPrice: number;
}

@Component({
  standalone: true,
  selector: 'app-instructor-profile',
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss'],
  imports: [
    CommonModule,        // for *ngIf, *ngFor, etc. :contentReference[oaicite:0]{index=0}
    ReactiveFormsModule  // for formGroup, formControlName :contentReference[oaicite:1]{index=1}
  ]
})
export class InstructorProfileComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Initialize the form *after* fb is assigned to avoid TS2729 :contentReference[oaicite:2]{index=2}
    this.form = this.fb.group({
      firstName:        ['', Validators.required],
      lastName:         ['', Validators.required],
      email:            ['', [Validators.required, Validators.email]],
      favouriteCategory:['', Validators.required],
      universityInfo:   ['', Validators.required],
      bio:              ['', Validators.required],
      // Use a numeric default (0) so patchValue of a number works without type mismatch :contentReference[oaicite:3]{index=3}
      avgPrice:         [0, [Validators.required, Validators.min(1)]],
      password:         [''],
      confirmPassword:  ['']
    });
  }

  ngOnInit(): void {
    this.http
      .get<InstructorInfo>(
        'http://localhost:8080/api/personal-info/get-personal-info',
        { withCredentials: true }
      )
      .subscribe({
        next: info => {
          // patchValue accepts numbers here because control was initialized with a number :contentReference[oaicite:4]{index=4}
          this.form.patchValue({
            firstName: info.firstName,
            lastName:  info.lastName,
            email:     info.email,
            favouriteCategory: info.favouriteCategory,
            universityInfo:    info.universityInfo,
            bio:                info.bio,
            avgPrice:           info.avgPrice
          });
        },
        error: err => console.error('Failed to load profile', err)
      });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.value;
    if (password && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.http
      .put(
        'http://localhost:8080/api/personal-info/edit-info',
        this.form.value,
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      )
      .subscribe({
        next: () => alert('Your information was successfully updated!'),
        error: err => console.error('Profile update failed', err)
      });
  }
}
