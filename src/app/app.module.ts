// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgxStripeModule } from 'ngx-stripe';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Check if this file actually exists and the path is correct
// The error might be related to this import
import { environments } from '../environements/environements';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FindInstructorComponent } from './components/find-instructor/find-instructor.component';
import { PostsComponent } from './components/posts/posts.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NavBlankComponent } from './components/nav-blank/nav-blank.component';
import { NavAuthComponent } from './components/nav-auth/nav-auth.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from './components/blank-layout/blank-layout.component';
import { InstructorBioComponent } from './components/instructor-bio/instructor-bio.component';
import { InstructorLayoutComponent } from './components/instructor-layout/instructor-layout.component';
import { NavInstructorComponent } from './components/nav-instructor/nav-instructor.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { ReportComponent } from './components/report/report.component';
import { LearnerOfferComponent } from './components/learner-offer/learner-offer.component';

// Create a separate constant for the NgxStripeModule and AngularFireModule
// to isolate potential issues
const stripeModule = NgxStripeModule.forRoot(environments.stripe.publicKey);
const firebaseModule = AngularFireModule.initializeApp(environments.firebase);

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    // FindInstructorComponent,
    PostsComponent,
    NotFoundComponent,
    NavBlankComponent,
    NavAuthComponent,
    AuthLayoutComponent,
    BlankLayoutComponent,
    InstructorBioComponent,
    InstructorLayoutComponent,
    NavInstructorComponent,
    AdminLayoutComponent,
    AdminNavComponent,
    ReportComponent,
    LearnerOfferComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    stripeModule,
    firebaseModule,
    AngularFirestoreModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {};