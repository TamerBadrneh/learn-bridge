import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-rating',
  standalone: false,
  templateUrl: './add-rating.component.html',
  styleUrls: ['./add-rating.component.scss'],
})
export class AddRatingComponent implements OnInit {
  selectedRating = 0;
  reviewText = '';
  showError = false;
  chatId: number | null = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const chatId = sessionStorage.getItem('rateChatId');
    if (chatId) {
      this.chatId = +chatId;
    } else {
      alert('Chat ID not found.');
      this.router.navigate(['/learner/home']);
    }
  }

  selectRating(rating: number) {
    this.selectedRating = rating;
  }

  skip() {
    this.router.navigate(['/learner/home']);
  }

  submit() {
    this.showError = false;

    if (this.selectedRating === 0 || !this.reviewText.trim()) {
      this.showError = true;
      return;
    }

    const payload = {
      rating: this.selectedRating,
      comment: this.reviewText,
    };

    this.http
      .post(
        `http://localhost:8080/api/review/add-review/${this.chatId}`,
        payload,
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          alert('Rate Added Successfully.');
          this.router.navigate(['/learner/home']);
        },
        error: (err) => {
          console.error('Rate submission failed:', err);
          alert('Failed to add Rating.');
        },
      });
  }
}
