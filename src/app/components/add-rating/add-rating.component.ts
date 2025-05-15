import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-rating',
  standalone: false,
  templateUrl: './add-rating.component.html',
  styleUrl: './add-rating.component.scss',
})
export class AddRatingComponent {
  selectedRating = 0;
  reviewText = '';
  showError = false;

  constructor(private router: Router) {}

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

    this.sendReview(this.selectedRating, this.reviewText).then(() => {
      this.router.navigate(['/learner/home']);
    });
  }

  async sendReview(rating: number, comment: string): Promise<void> {
    return new Promise(() => {
      console.log('Sending review:', { rating, comment });
      alert('Operation done successfully.');
    });
  }
}
