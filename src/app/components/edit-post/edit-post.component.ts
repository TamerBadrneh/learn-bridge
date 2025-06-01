import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// Documneted By Tamer

// Interface Type definition...
interface PostDTO {
  postId: number;
  authorId: number;
  subject: string;
  content: string;
  price: number;
  category: string;
  postStatus: string;
  sessionDeadline: string | null;
}

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.scss'],
})
export class EditPostComponent implements OnInit {
  // Data Memebers
  form!: FormGroup;

  // Another way of injection instead of constructor for learning purposes
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private baseUrl = 'http://localhost:8080/api/posts';
  categories = ['IT', 'SCIENCE', 'LANGUAGES', 'MEDICAL'];

  /**
   * Called when the component is initialized.
   * Fetches the post data from the server, builds the form and patches the form values.
   * If the post is not found, it will display an alert with the error message.
   * @memberof EditPostComponent
   */
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
      sessionDeadline: [null, Validators.required],
    });

    this.http
      .get<PostDTO>(`${this.baseUrl}/${postId}`, { withCredentials: true })
      .subscribe({
        next: (dto) => {
          const dateOnly = dto.sessionDeadline
            ? dto.sessionDeadline.substring(0, 10)
            : null;

          this.form.patchValue({
            authorId: dto.authorId,
            subject: dto.subject,
            content: dto.content,
            price: dto.price,
            category: dto.category,
            postStatus: dto.postStatus,
            sessionDeadline: dateOnly,
          });
        },
        error: (err) => {
          alert('Error loading post: ' + err.message);
        },
      });
  }

  /**
   * Handles the form submission for editing a post.
   * If the form is valid, it sends an HTTP PUT request to update the post details.
   * On successful update, navigates to the 'my-posts' page.
   * Displays an alert if the update fails.
   * @memberof EditPostComponent
   */
  onSubmit() {
    if (this.form.invalid) return;
    const dto: PostDTO = this.form.value;

    this.http
      .put<PostDTO>(`${this.baseUrl}/edit-post`, dto, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        withCredentials: true,
      })
      .subscribe({
        next: () => {
          alert('Post updated!');
          this.router.navigate(['/learner', 'my-posts']);
        },
        error: (err) => {
          alert('Update failed: ' + err.error);
        },
      });
  }
}
