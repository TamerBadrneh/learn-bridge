import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent {
  constructor(private http: HttpClient, private router: Router) {}

  categories: string[] = ['IT', 'SCIENCE', 'LANGUAGES', 'MEDICAL'];

  formData = {
    subject: '',
    category: '',
    content: '',
    price: null as number | null,
  };

  showError = false;

  onSubmit() {
    if (
      !this.formData.subject ||
      !this.formData.category ||
      !this.formData.content ||
      !this.formData.price ||
      this.formData.price <= 0
    ) {
      this.showError = true;
      return;
    }

    this.showError = false;

    this.http
      .post(
        'http://localhost:8080/api/posts/create-post',
        { ...this.formData },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      )
      .subscribe({
        next: () => {
          alert('Post created successfully!');
          this.router.navigate(['/learner/my-posts']);
        },
        error: (err) => console.error('Error creating post', err),
      });
  }
}
