import { Component, ViewChild, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  StripeService,
  StripeCardComponent,
  NgxStripeModule,
} from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, NgxStripeModule],
})
export class AddCardComponent implements OnInit {
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  cardForm: FormGroup;
  hasCard = false;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private stripeService: StripeService,
    private authService: AuthService
  ) {
    this.cardForm = this.fb.group({
      holderName: ['', [Validators.required]],
      isDefault: [true],
    });
  }

  ngOnInit() {
    this.http
      .get<{ hasCard: boolean }>('http://localhost:8080/api/cards/has-card', {
        withCredentials: true,
      })
      .subscribe({
        next: (res) => {
          this.hasCard = res.hasCard;
          console.log('Has card:', this.hasCard);
        },
        error: (err) => {
          console.error('Failed to check card:', err);
        },
      });
  }

  onSubmit() {
    if (this.cardForm.invalid) return;

    const holderName = this.cardForm.get('holderName')?.value;
    const isDefault = this.cardForm.get('isDefault')?.value;

    this.stripeService
      .createPaymentMethod({
        type: 'card',
        card: this.card.element,
        billing_details: {
          name: holderName,
        },
      })
      .subscribe({
        next: (result) => {
          if (result.paymentMethod) {
            const payload = {
              paymentMethodId: result.paymentMethod.id,
              holderName,
              isDefault,
            };

            this.http
              .post('http://localhost:8080/api/cards/add', payload, {
                withCredentials: true,
                headers: new HttpHeaders({
                  'Content-Type': 'application/json',
                }),
              })
              .subscribe({
                next: () => {
                  alert('Card Added Successfully!');
                  const role =
                    this.authService.userData.role.toLowerCase() || '';

                  const route = this.hasCard
                    ? `${role}/payment`
                    : `${role}/home`;
                  this.router.navigate([route]);
                },
                error: (err) => {
                  console.error('Error adding card:', err);
                  alert('Failed to add card. Please try again.');
                },
              });
          } else if (result.error) {
            console.error(result.error.message);
            alert(result.error.message);
          }
        },
        error: (err) => {
          console.error('Stripe PaymentMethod creation failed:', err);
          alert('Failed to create card payment method. Please try again.');
        },
      });
  }

  cancel() {
    const role = this.authService.userData.role.toLowerCase() || '';
    if (!this.hasCard) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate([`${role}/payment`]);
    }
  }
}
