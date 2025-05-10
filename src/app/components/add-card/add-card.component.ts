import { Component, ViewChild } from '@angular/core';
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
export class AddCardComponent {
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  cardForm: FormGroup;

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

  onSubmit() {
    if (this.cardForm.invalid) {
      return;
    }

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
              holderName: holderName,
              isDefault: isDefault,
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

                  let wasNewUser = false;

                  if (localStorage.getItem('isNewUser') === 'true') {
                    localStorage.setItem('isNewUser', 'false');
                    wasNewUser = true;
                  }

                  const role =
                    this.authService.userData.role.toLowerCase() || '';

                  this.router.navigate([
                    `${role}/${wasNewUser ? 'home' : 'payment'}`,
                  ]);
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
    if (localStorage.getItem('isNewUser') === 'true') {
      this.router.navigate(['/login']);
      return;
    }

    const role = localStorage.getItem('role');

    if (role === 'instructor') {
      this.router.navigate(['/instructor/payment']);
    } else {
      this.router.navigate(['/learner/payment']);
    }
  }
}
