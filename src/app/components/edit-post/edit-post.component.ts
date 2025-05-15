import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule
} from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface PostDTO {
  postId: number;
  authorId: number;
  subject: string;
  content: string;
  price: number;
  category: string;
  postStatus: string;
  sessionDeadline: string | null;  // ISO date string
}

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss']
})
export class EditPostComponent implements OnInit {
  form!: FormGroup;
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private baseUrl = 'http://localhost:8080/api/posts';

  // your actual categories
  categories = ['IT', 'SCIENCE', 'LANGUAGES', 'MEDICAL'];

  ngOnInit() {
    const postId = Number(this.route.snapshot.paramMap.get('postId'));

    this.form = this.fb.group({
      postId: [postId, Validators.required],
      authorId: [null],
      subject: ['', Validators.required],
      content: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      postStatus: ['PENDING'],
      sessionDeadline: [null, Validators.required]
    });

    this.http
      .get<PostDTO>(`${this.baseUrl}/${postId}`, { withCredentials: true })
      .subscribe({
        next: dto => {
          // if your backend gives a full ISO datetime, trim to yyyy-MM-dd
          const dateOnly = dto.sessionDeadline
            ? dto.sessionDeadline.substring(0, 10)
            : null;

          this.form.patchValue({
            authorId: dto.authorId,
            subject: dto.subject,
            content: dto.content,
            price: dto.price,
            category: dto.category,            // patches the dropdown
            postStatus: dto.postStatus,
            sessionDeadline: dateOnly          // sets the <input type="date">
          });
        },
        error: err => {
          alert('Error loading post: ' + err.message);
        }
      });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const dto: PostDTO = this.form.value;

    this.http
      .put<PostDTO>(
        `${this.baseUrl}/edit-post`,
        dto,
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          withCredentials: true
        }
      )
      .subscribe({
        next: () => {
          alert('Post updated!');
          this.router.navigate(['/learner', 'my-posts']);
        },
        error: err => {
          alert('Update failed: ' + err.error);
        }
      });
  }
}
