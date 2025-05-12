// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxStripeModule } from 'ngx-stripe';
import { environment } from '../environements/environements';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { InstructorProfile } from './components/Instructor-profile/instructor-profile.component';
import { LearnerProfile } from './components/learner-profile/learner-profile.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminNavComponent } from './components/admin-nav/admin-nav.component';
import { ChatComponent } from './components/chat/chat.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    FindInstructorComponent,
    PostsComponent,
    PaymentComponent,
    MyPostsComponent,
    NotFoundComponent,
    NavBlankComponent,
    NavAuthComponent,
    AuthLayoutComponent,
    BlankLayoutComponent,
    CreatePostComponent,
    InstructorBioComponent,
    InstructorLayoutComponent,
    NavInstructorComponent,
    InstructorProfile,
    LearnerProfile,
    AdminLayoutComponent,
    AdminNavComponent,
    // ChatComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,

    // Stripe Elements
    NgxStripeModule.forRoot(environment.stripe.publicKey),

    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,

    // firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,

    // chat component
    ChatComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
