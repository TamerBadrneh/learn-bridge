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

// Documented By Tamer

@Component({
  standalone: true,
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, NgxStripeModule],
})
export class AddCardComponent implements OnInit {
  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  // Members
  cardForm: FormGroup;
  hasCard = false;

  // Styling logic for some unique animations by JS
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

  // Stripe localization
  elementsOptions: StripeElementsOptions = {
    locale: 'en',
  };

  /**
   * Creates an instance of the AddCardComponent.
   *
   * @param fb A form builder for creating a reactive form.
   * @param http An HTTP client for making requests to the server.
   * @param router A router for navigating to other pages.
   * @param stripeService A Stripe service for creating a Stripe payment
   *                      intent.
   * @param authService An authentication service for authenticating the user.
   */
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

  /**
   * Called when the component is initialized.
   *
   * Checks if the user already has a card in the server.
   * Sets the hasCard property to true if the user already has a card,
   * otherwise, sets it to false.
   *
   * Shows an error if the request fails.
   */
  ngOnInit() {
    this.http
      .get<{ hasCard: boolean }>(
        'https://learn-bridge-back-end.onrender.com/api/cards/has-card',
        {
          withCredentials: true,
        }
      )
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

  /**
   * Submits the card form and adds a new card to the user's profile.
   *
   * Checks if the card form is invalid, and if so, does nothing.
   *
   * Otherwise, creates a Stripe payment method with the card details and
   * billing details from the form.
   *
   * If the payment method is successfully created, makes a POST request to the
   * server to add the card to the user's profile.
   *
   * If the request is successful, alerts the user that the card was added
   * successfully, and navigates to the payment page if the user already has a
   * card, or to the home page if the user does not have a card.
   *
   * If the request fails, alerts the user with an error message.
   */
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
              .post(
                'https://learn-bridge-back-end.onrender.com/api/cards/add',
                payload,
                {
                  withCredentials: true,
                  headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                  }),
                }
              )
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

  /**
   * Navigates the user based on their role and card status.
   * If the user has no card, they are redirected to the login page.
   * Otherwise, they are redirected to the payment page based on their role.
   */

  cancel() {
    const role = this.authService.userData.role.toLowerCase() || '';
    if (!this.hasCard) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate([`${role}/payment`]);
    }
  }
}
