import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

interface CardDTO {
  cardId: number;
  holderName: string;
  cardNumber: string;      // e.g. "xxxxxxxxxxxx1234"
  cardType: string;        // e.g. "VISA", "MASTERCARD"
  expiryDate: string;      // now a simple "MM/yy" string
}

interface PaymentInfoDTO {
  id: number;
  paymentDate: string;    // ISO timestamp
  paymentId: string;
  amount: number;
  senderName: string;     // added
  receiverName: string;   // added
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  cards: CardDTO[] = [];
  paymentHistory: PaymentInfoDTO[] = [];
  loadingCards = false;
  loadingHistory = false;
  errorCards: string | null = null;
  errorHistory: string | null = null;

  private cardsUrl = 'http://localhost:8080/api/cards/my-cards';
  private historyUrl = 'http://localhost:8080/api/payment/my-payments-info';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadCards();
    this.loadHistory();
  }

  addCard(): void {
    this.router.navigate(['/learner/add-card']);
  }

  private loadCards(): void {
    this.loadingCards = true;
    this.errorCards = null;

    this.http.get<CardDTO[]>(this.cardsUrl, { withCredentials: true })
      .subscribe({
        next: cards => {
          this.cards = cards;
          this.loadingCards = false;
        },
        error: err => {
          console.error(err);
          this.errorCards = 'Could not load saved cards.';
          this.loadingCards = false;
        }
      });
  }

  deleteCard(cardId: number): void {
    if (!confirm('Are you sure you want to delete this card?')) return;

    this.http.delete(
      `http://localhost:8080/api/cards/${cardId}`,
      { withCredentials: true, responseType: 'text' as 'text' }
    ).subscribe({
      next: () => this.cards = this.cards.filter(c => c.cardId !== cardId),
      error: err => {
        console.error(err);
        alert('Could not delete the card.');
      }
    });
  }

  private loadHistory(): void {
    this.loadingHistory = true;
    this.errorHistory = null;

    this.http.get<PaymentInfoDTO[]>(this.historyUrl, { withCredentials: true })
      .subscribe({
        next: history => {
          this.paymentHistory = history;
          this.loadingHistory = false;
        },
        error: err => {
          console.error(err);
          this.errorHistory = 'Could not load payment history.';
          this.loadingHistory = false;
        }
      });
  }

  trackByCardId(_: number, card: CardDTO) {
    return card.cardId;
  }
}
