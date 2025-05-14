import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,    // for *ngIf, *ngFor, etc.
    FormsModule,     // for ngModel, ngForm
    HttpClientModule // for HttpClient
  ],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  categories: string[] = ['IT', 'SCIENCE', 'LANGUAGES', 'MEDICAL'];
  today: string = '';
  showError = false;

  formData: {
    subject: string;
    category: string;
    content: string;
    price: number | null;
    sessionDeadline: string | null;
  } = {
    subject: '',
    category: '',
    content: '',
    price: null,
    sessionDeadline: null
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Set min date for the date picker
    this.today = new Date().toISOString().split('T')[0];
  }

  onSubmit(form: NgForm): void {
    if (
      form.invalid ||
      !this.formData.sessionDeadline ||
      new Date(this.formData.sessionDeadline) < new Date(this.today)
    ) {
      this.showError = true;
      return;
    }

    this.showError = false;

    const payload = {
      subject: this.formData.subject,
      category: this.formData.category,
      content: this.formData.content,
      price: this.formData.price,
      sessionDeadline: this.formData.sessionDeadline
    };

    this.http
      .post('http://localhost:8080/api/posts/create-post', payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      })
      .subscribe({
        next: () => {
          alert('Post created successfully!');
          this.router.navigate(['/learner/my-posts']);
        },
        error: (err) => {
          console.error('Error creating post', err);
          this.showError = true;
        }
      });
  }
}
