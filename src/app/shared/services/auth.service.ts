// // import { HttpClient } from '@angular/common/http';
// // import { Injectable } from '@angular/core';
// // import { Observable } from 'rxjs';

// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class AuthService {

// //   constructor(private _HttpClient: HttpClient) { }

// //   setRegister(userData: object): Observable<any> {
// //     return this._HttpClient.post('https://ecommerce.routemisr.com/api/v1/auth/signup', userData);
// //   }

// //   setLogin(userData: object): Observable<any> {
// //     return this._HttpClient.get('https://route-ecommerce.vercel.app/api/v1/auth/signin', userData);
// //   }
// // }


// // *********************************************************************************************


// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Router } from '@angular/router';
// import { jwtDecode } from 'jwt-decode';
// import { Observable, of, throwError } from 'rxjs';
// import { delay } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   // Mock user storage (simulating a database)
//   private users: any[] = [];
//   userData:any;
//   // Flag to track login status
//   private isLoggedIn = false;

//   constructor(private _HttpClient: HttpClient, private _Router: Router) { }


//   // decodeUserData(){
//   //   if(localStorage.getItem("eToken") != null){
//   //     let encodeToken:any = localStorage.getItem("eToken");

//   //     let decodeToken = jwtDecode(encodeToken);

//   //     this.userData = decodeToken;
//   //   }
//   // }

//   // Mock registration method (unchanged from previous version)
//   setRegister(userData: any): Observable<any> {
//     const existingUser = this.users.find(user => user.email === userData.email);

//     if (existingUser) {
//       return throwError(() => ({
//         error: { message: 'Email already exists' }
//       }));
//     }

//     this.users.push(userData);

//     return of({ success: true, message: 'Registration successful' }).pipe(
//       delay(1000)
//     );
//   }

//   // Mock login method with success detection
//   setLogin(credentials: any): Observable<any> {
//     const user = this.users.find(
//       u => u.email === credentials.email && u.password === credentials.password
//     );

//     if (user) {
//       // Set login status to true
//       this.isLoggedIn = true;

//       return of({
//         success: true,
//         user,
//         message: 'Login successful'
//       });
//     } else {
//       // Reset login status
//       this.isLoggedIn = false;

//       return throwError(() => ({
//         error: { message: 'Invalid email or password' }
//       }));
//     }
//   }

//   // Method to check login status
//   getIsLoggedIn(): boolean {
//     return this.isLoggedIn;
//   }

//   // Method to logout
//   logout() {
//     this.isLoggedIn = false;
//     // localStorage.removeItem("eToken");
//     this._Router.navigate(['/login']);

//   }
// }




import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: any;

  constructor(private _HttpClient: HttpClient, private _Router: Router) {}

  setRegister(userData: any): Observable<any> {
    return this._HttpClient.post('http://localhost:8080/api/register', userData);
  }

  setLogin(userData: any): Observable<any> {
    const body = new HttpParams()
      .set('username', userData.email)
      .set('password', userData.password);

    return this._HttpClient.post('http://localhost:8080/api/login', body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      withCredentials: true
    });
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
    return this._HttpClient.get('http://localhost:8080/api/user/current', {
      withCredentials: true
    }).pipe(
      tap((user) => {
        console.log('Raw user data:', user); // Add for debugging
        this.userData = user;
      })
    );
  }

  // Logout: Call backend logout endpoint
  logout() {
    this._HttpClient.post('http://localhost:8080/api/logout', {}, {
      withCredentials: true
    }).subscribe(() => {
      this.userData = null;
      this._Router.navigate(['/login']);
    });
  }
}
