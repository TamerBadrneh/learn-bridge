import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-instructor-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './instructor-profile.component.html',
  styleUrls: ['./instructor-profile.component.scss']
})
export class InstructorProfileComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  private apiUrl = 'http://localhost:8080/api/personal-info';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      favouriteCategory: ['', Validators.required],
      universityInfo: ['', Validators.required],
      bio: ['', Validators.required],
      avgPrice: [null, [Validators.required, Validators.min(1)]],
      password: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.http
      .get<any>(`${this.apiUrl}/get-personal-info`, { withCredentials: true })
      .subscribe({
        next: dto => {
          this.form.patchValue({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            favouriteCategory: dto.favouriteCategory,
            universityInfo: dto.universityInfo,
            bio: dto.bio,
            avgPrice: dto.avgPrice
          });
          this.imagePreview = dto.personalImage || null;
        },
        error: err => console.error('Failed to load profile', err)
      });
  }

  get passwordsMismatch(): boolean {
    const pw = this.form.get('password')?.value;
    const cpw = this.form.get('confirmPassword')?.value;
    return pw && cpw && pw !== cpw;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http
      .post<{ imageUrl: string }>(
        `${this.apiUrl}/upload-image`,
        formData,
        { withCredentials: true }
      )
      .subscribe({
        next: resp => {
          this.imagePreview = resp.imageUrl;
          this.selectedFile = null;
          alert('Profile photo updated.');
        },
        error: err => {
          console.error('Upload failed', err);
          alert('Upload failed.');
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid || this.passwordsMismatch) return;

    this.http
      .put(
        `${this.apiUrl}/edit-info`,
        this.form.value,
        { withCredentials: true }
      )
      .subscribe({
        next: () => alert('Your information was successfully updated!'),
        error: err => console.error('Profile update failed', err)
      });
  }
}
