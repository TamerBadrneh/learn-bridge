// src/app/app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NotFoundComponent } from './components/not-found/not-found.component';
import { BlankLayoutComponent } from './components/blank-layout/blank-layout.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';
import { HomeComponent } from './components/home/home.component';
import { FindInstructorComponent } from './components/find-instructor/find-instructor.component';
import { PostsComponent } from './components/posts/posts.component';
import { PaymentComponent } from './components/payment/payment.component';
import { MyPostsComponent } from './components/my-posts/my-posts.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CreatePostComponent } from './components/create-post/create-post.component';
import { InstructorBioComponent } from './components/instructor-bio/instructor-bio.component';
import { InstructorLayoutComponent } from './components/instructor-layout/instructor-layout.component';
import { InstructorProfileComponent } from './components/instructor-profile/instructor-profile.component';
import { LearnerProfileComponent } from './components/learner-profile/learner-profile.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { PendingPostsComponent } from './components/pending-posts/pending-posts.component';
import { PendingReportsComponent } from './components/pendingreports/pendingreports.component';
import { AddCardComponent } from './components/add-card/add-card.component';
import { EditPostComponent } from './components/edit-post/edit-post.component';
import { AgreementComponent } from './components/agreement/agreement.component';
import { ChatComponent } from './components/chat/chat.component';
import { ReportComponent } from './components/report/report.component';
import { ViewProfileComponent } from './components/viewprofile/viewprofile.component';

const routes: Routes = [
  // Guest Pages
  // Routing Config status => WORKS WELL
  // No Comments on...
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'home', component: HomeComponent, title: 'Home' },
      {
        path: 'find-instructor',
        component: FindInstructorComponent,
        title: 'Find Instructor',
      },
      { path: 'posts', component: PostsComponent, title: 'Posts' },
    ],
  },

  // Admin Pages
  // Routing Config status => WORKS WELL
  // 1 Page Left to associate => Chat and I will handle it...
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent, title: 'Home' },
      {
        path: 'find-instructor',
        component: FindInstructorComponent,
        title: 'Find Instructor',
      },
      { path: 'posts', component: PostsComponent, title: 'Posts' },
      {
        path: 'pending-posts',
        component: PendingPostsComponent,
        title: 'Pending Posts',
      },
      {
        path: 'pending-reports',
        component: PendingReportsComponent,
        title: 'Pending Reports',
      },
      { path: 'chat', component: ChatComponent, title: 'Chat' },
    ],
  },

  // Learner Pages
  // Routing Config status => WORKS WELL
  // 1 New Page should be added and modified by Zaid here => View Profile, bcs it's rendering the nav bar for the instructor instead of learner...
  {
    path: 'learner',
    component: BlankLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, title: 'Home' },
      {
        path: 'find-instructor',
        component: FindInstructorComponent,
        title: 'Find Instructor',
      },
      { path: 'payment', component: PaymentComponent, title: 'Payment' },
      { path: 'add-card', component: AddCardComponent, title: 'Add Card' },
      { path: 'my-posts', component: MyPostsComponent, title: 'My Posts' },
      {
        path: 'create-post',
        component: CreatePostComponent,
        title: 'Create Post',
      },
      {
        path: 'learner-profile',
        component: LearnerProfileComponent,
        title: 'Learner Profile',
      },
      {
        path: 'edit-post',
        component: EditPostComponent,
        title: 'Edit Post',
      },
      {
        path: 'chat',
        component: ChatComponent,
        title: 'Chat',
      },
      {
        path: 'report-user',
        component: ReportComponent,
        title: 'Report',
      },
      {
        path: 'agreement',
        component: AgreementComponent,
        title: 'Agreement Confirmation',
      },
    ],
  },

  // Instructor Pages
  // Routing Cinfig stats => WORKS WELL
  // 1 Old Page should be naviagted to successfully "ADD-CARD", Tamer will fix it.
  {
    path: 'instructor',
    component: InstructorLayoutComponent,
    children: [
      { path: 'home', component: HomeComponent, title: 'Home' },
      { path: 'posts', component: PostsComponent, title: 'Posts' },
      { path: 'payment', component: PaymentComponent, title: 'Payment' },
      {
        path: 'instructor-bio',
        component: InstructorBioComponent,
        title: 'Instructor Bio',
      },

      // MODIFY as noted in Learner Stats
      // Profile by ID
      {
        path: ':id/view-profile',
        component: ViewProfileComponent,
        title: 'Instructor Profile',
      },

      { path: 'add-card', component: AddCardComponent, title: 'Add Card' },
      {
        path: 'chat',
        component: ChatComponent,
        title: 'Chat',
      },
      {
        path: 'report-user',
        component: ReportComponent,
        title: 'Report',
      },
      {
        path: 'instructor-profile',
        component: InstructorProfileComponent,
        title: 'Instructor Profile',
      },
    ],
  },

  // Mandatory Add Card route (global)
  { path: 'add-card', component: AddCardComponent, title: 'Add Your Card' },

  // 404 Fallback
  { path: '**', component: NotFoundComponent, title: 'Not Found' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
