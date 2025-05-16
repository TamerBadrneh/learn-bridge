// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgxStripeModule } from 'ngx-stripe';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { environment } from '../environements/environements';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Components
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FindInstructorComponent } from './components/find-instructor/find-instructor.component';
import { PostsComponent } from './components/posts/posts.component';
import { PaymentComponent } from './components/payment/payment.component';
import { MyPostsComponent } from './components/my-posts/my-posts.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NavBlankComponent } from './components/nav-blank/nav-blank.component';
import { NavAuthComponent } from './components/nav-auth/nav-auth.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { BlankLayoutComponent } from './components/blank-layout/blank-layout.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { InstructorBioComponent } from './components/instructor-bio/instructor-bio.component';
import { InstructorLayoutComponent } from './components/instructor-layout/instructor-layout.component';
import { NavInstructorComponent } from './components/nav-instructor/nav-instructor.component';
import { InstructorProfileComponent } from './components/instructor-profile/instructor-profile.component';
import { LearnerProfileComponent } from './components/learner-profile/learner-profile.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { ChatComponent } from './components/chat/chat.component';
import { ReportComponent } from './components/report/report.component';
import { AddRatingComponent } from './components/add-rating/add-rating.component';
import { LearnerOfferComponent } from './components/learner-offer/learner-offer.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    FindInstructorComponent,
    PostsComponent,
    // PaymentComponent,
    // MyPostsComponent,
    NotFoundComponent,
    NavBlankComponent,
    NavAuthComponent,
    AuthLayoutComponent,
    BlankLayoutComponent,
    // CreatePostComponent,
    InstructorBioComponent,
    InstructorLayoutComponent,
    NavInstructorComponent,
    // InstructorProfileComponent,
    // LearnerProfileComponent,
    AdminLayoutComponent,
    AdminNavComponent,
    ReportComponent,
    LearnerOfferComponent,
    // AddRatingComponent,
    // ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    NgxStripeModule.forRoot(environment.stripe.publicKey),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
