import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import axios from 'axios';

@Component({
  selector: 'app-instructor-bio',
  standalone: false,
  templateUrl: './instructor-bio.component.html',
  styleUrls: ['./instructor-bio.component.scss'],
})
export class InstructorBioComponent implements OnInit {
  bioForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private _FormBuilder: FormBuilder,
    private _AuthService: AuthService,
    private _Router: Router
  ) {}

  ngOnInit() {
    this.bioForm = this._FormBuilder.group({
      universityInfo: ['', Validators.required],
      bio: ['', Validators.required],
      avgPrice: ['', [Validators.required, Validators.min(0)]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bioForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmitBio() {
    if (this.bioForm.invalid) {
      return;
    }

    const pendingDataString = localStorage.getItem('pendingInstructor');

    if (!pendingDataString) {
      this.errorMessage = 'Registration data not found. Please register again.';
      return;
    }

    const pendingData = JSON.parse(pendingDataString);

    const fullUserData = {
      firstName: pendingData.firstName,
      lastName: pendingData.lastName,
      email: pendingData.email,
      password: pendingData.password,
      role: pendingData.role,
      favouriteCategory: pendingData.favouriteCategory,
      bio: this.bioForm.value.bio,
      avgPrice: this.bioForm.value.avgPrice,
      universityInfo: this.bioForm.value.universityInfo,
    };

    this.isLoading = true;

    axios
      .post('http://localhost:8080/api/register', fullUserData)
      .then(() => {
        this.isLoading = false;
        alert('Bio Successfully Updated !');

        localStorage.setItem('isNewUser', 'true');

        this._Router.navigate(['/login']);
      })
      .catch((error) => {
        console.log(error);
        this.isLoading = false;
        this.errorMessage = 'Something went wrong. Please try again.';
      });
  }
}
