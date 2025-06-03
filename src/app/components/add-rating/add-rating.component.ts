import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // <-- for *ngIf, *ngFor, ngClass :contentReference[oaicite:0]{index=0}
import { FormsModule } from '@angular/forms'; // <-- for [(ngModel)] :contentReference[oaicite:1]{index=1}

@Component({
  selector: 'app-add-rating',
  standalone: true, // <-- mark it standalone
  imports: [CommonModule, FormsModule],
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
    const stored = sessionStorage.getItem('rateChatId');
    if (stored) {
      this.chatId = +stored;
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
      stars: this.selectedRating,
      description: this.reviewText.trim(),
    };

    this.http
      .post(
        `https://learn-bridge-back-end.onrender.com/api/review/add-review/${this.chatId}`,
        payload,
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          alert('Rating added successfully.');
          this.router.navigate(['/learner/home']);
        },
        error: (err) => {
          console.error('Rate submission failed:', err);
          alert('Failed to add rating.');
        },
      });
  }
}
