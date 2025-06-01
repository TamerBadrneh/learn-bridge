import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

// Documented By Tamer
@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule, // for *ngIf, *ngFor, etc.
    FormsModule, // for ngModel, ngForm
    HttpClientModule, // for HttpClient
  ],
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  // Data Members
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
    sessionDeadline: null,
  };

  // Constructor with Injected Values for use...
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Initialize the component.
   * Sets the min date for the date picker to today.
   */
  ngOnInit(): void {
    this.today = new Date().toISOString().split('T')[0];
  }

  /**
   * Called when the form is submitted.
   * If the form is invalid or the deadline is before today, it shows an error.
   * Otherwise, it creates a new post with the given details and navigates to the
   * learner's post list.
   * @param form The NgForm instance.
   */
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
      sessionDeadline: this.formData.sessionDeadline,
    };

    this.http
      .post('http://localhost:8080/api/posts/create-post', payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          alert('Post created successfully!');
          console.log(this.formData);
          this.router.navigate(['/learner/my-posts']);
        },
        error: (err) => {
          console.error('Error creating post', err);
          this.showError = true;
        },
      });
  }
}
