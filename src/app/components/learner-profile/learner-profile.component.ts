import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';           
import { FormsModule, NgForm } from '@angular/forms';    
import { HttpClient } from '@angular/common/http';

interface PersonalInfoDTO {
  userRole: string;
  firstName: string;
  lastName: string;
  email: string;
  favouriteCategory: string;
  personalImage?: string; // Base64 data URI
}

@Component({
  selector: 'app-learner-profile',
  standalone: true,
  imports: [
    CommonModule,    
    FormsModule      
  ],
  templateUrl: './learner-profile.component.html',
  styleUrls: ['./learner-profile.component.scss']
})
export class LearnerProfileComponent implements OnInit {
  formData: PersonalInfoDTO & { password: string; confirmPassword: string } = {
    userRole: '',
    firstName: '',
    lastName: '',
    email: '',
    favouriteCategory: '',
    password: '',
    confirmPassword: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  private apiUrl = 'http://localhost:8080/api/personal-info';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get<PersonalInfoDTO>(`${this.apiUrl}/get-personal-info`, { withCredentials: true })
      .subscribe({
        next: dto => {
          this.formData = { ...this.formData, ...dto };
          this.imagePreview = dto.personalImage || null;
        },
        error: err => console.error('Failed to load profile', err)
      });
  }

  hasPasswordMismatch(): boolean {
    return (
      !!this.formData.password &&
      !!this.formData.confirmPassword &&
      this.formData.password !== this.formData.confirmPassword
    );
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.selectedFile) return;
    const form = new FormData();
    form.append('image', this.selectedFile);

    this.http
      .post<{ imageUrl: string }>(
        `${this.apiUrl}/upload-image`,
        form,
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

  submitForm(form: NgForm): void {
    if (form.invalid || this.hasPasswordMismatch()) return;

    const payload = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      email: this.formData.email,
      password: this.formData.password,
      favouriteCategory: this.formData.favouriteCategory
      // image handled separately via uploadImage()
    };

    this.http
      .put(
        `${this.apiUrl}/edit-info`,
        payload,
        { withCredentials: true }
      )
      .subscribe({
        next: () => alert('Your information was successfully updated!'),
        error: err => console.error('Profile update failed', err)
      });
  }
}
