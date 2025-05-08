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
import { InstructorProfile } from './components/Instructor-profile/instructor-profile.component';
import { LearnerProfile } from './components/learner-profile/learner-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'instructor-bio',
        component: InstructorBioComponent,
        title: 'Instructor Bio',
      },
      { path: 'home', component: HomeComponent, title: 'Home' },
      {
        path: 'findinstructor',
        component: FindInstructorComponent,
        title: 'Find Instructor',
      },
      { path: 'posts', component: PostsComponent, title: 'Posts' },
    ],
  },

  {
    path: 'learner',
    component: BlankLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent, title: 'Home' },
      {
        path: 'findinstructor',
        component: FindInstructorComponent,
        title: 'Find Instructor',
      },
      { path: 'posts', component: PostsComponent, title: 'Posts' },
      { path: 'payment', component: PaymentComponent, title: 'Payment' },
      { path: 'myposts', component: MyPostsComponent, title: 'Myposts' },

      {
        path: 'create-post',
        component: CreatePostComponent,
        title: 'CreatePost',
      },

      {
        path: 'learner-profile',
        component: LearnerProfile,
        title: 'Learner Profile',
      },
    ],
  },
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
      {
        path: 'instructor-profile',
        component: InstructorProfile,
        title: 'Instructor Profile',
      },
    ],
  },

  { path: '**', component: NotFoundComponent, title: 'NotFound' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
