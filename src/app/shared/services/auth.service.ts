import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;

  constructor(private _HttpClient: HttpClient, private _Router: Router) {}

  setRegister(userData: any): Observable<any> {
    return this._HttpClient.post(
      'https://learn-bridge-back-end.onrender.com/api/register',
      userData
    );
  }

  setLogin(userData: any): Observable<any> {
    const body = new HttpParams()
      .set('username', userData.email)
      .set('password', userData.password);

    return this._HttpClient.post(
      'https://learn-bridge-back-end.onrender.com/api/login',
      body.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        withCredentials: true,
      }
    );
  }

  // decodeUserData() {
  //   if (localStorage.getItem("eToken") != null) {
  //     let encodeToken: any = localStorage.getItem("eToken");
  //     let decodeToken = jwtDecode(encodeToken);
  //     this.userData = decodeToken;
  //   }
  // }

  // Fetch user data after login
  fetchUserData(): Observable<any> {
    return this._HttpClient
      .get('https://learn-bridge-back-end.onrender.com/api/user/current', {
        withCredentials: true,
      })
      .pipe(
        tap((user) => {
          console.log('Raw user data:', user); 
          this.userData = user;
        })
      );
  }

  // Logout: Call backend logout endpoint
  logout() {
    this._HttpClient
      .post(
        'https://learn-bridge-back-end.onrender.com/api/logout',
        {},
        {
          withCredentials: true,
        }
      )
      .subscribe(() => {
        this.userData = null;
        this._Router.navigate(['/login']);
      });
  }
}
