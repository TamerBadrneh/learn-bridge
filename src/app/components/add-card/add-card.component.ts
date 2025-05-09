import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-add-card',
  imports: [FormsModule, CommonModule], // Add CommonModule here
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
})
export class AddCardComponent {
  card = {
    cardNumber: '',
    expireDate: '',
    cvv: '',
    cvc: '',
    holderName: '',
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(form: any) {
    if (form.valid) {
      const payload = {
        cardNumber: this.card.cardNumber,
        expireDate: this.card.expireDate,
        holderName: this.card.holderName,
      };

      this.http
        .post('http://localhost:8080/api/cards/add', payload, {
          withCredentials: true,
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        })
        .subscribe({
          next: () => {
            alert('Card Added Successfully !');
          },
          error: (err) => {
            console.error('Error adding card:', err);
          },
        });
    }
  }

  // TODO: Ask Zaid for new endpoint so we can navigate correctly
  // Or we can store the data in local Storage "not recommended"...
  cancel() {
    const role = localStorage.getItem('role');
    if (role === 'instructor') {
      this.router.navigate(['/instructor/payment']);
    } else {
      this.router.navigate(['/learner/payment']);
    }
  }
}
