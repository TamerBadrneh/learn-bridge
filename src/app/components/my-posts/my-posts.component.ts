import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Post {
  postId: number;
  postStatus: string;
  category: string;
  subject: string;
  content: string;
  price: number;
  sessionDeadline: string;
}

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.scss'],
})
export class MyPostsComponent implements OnInit {
  allPosts: Post[] = [];
  displayedPosts: Post[] = [];
  currentPage = 1;
  postsPerPage = 3;
  currentFilter = 'ALL';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.http
      .get<Post[]>('http://localhost:8080/api/posts/my-posts', {
        withCredentials: true
      })
      .subscribe(posts => {
        this.allPosts = posts.filter(p => p.postStatus !== 'ON_HOLD');
        this.applyFilter();
      }, err => {
        console.error('Could not fetch posts', err);
      });
  }

  applyFilter(): void {
    const filtered =
      this.currentFilter === 'ALL'
        ? this.allPosts
        : this.allPosts.filter(p => p.postStatus === this.currentFilter);

    const start = (this.currentPage - 1) * this.postsPerPage;
    this.displayedPosts = filtered.slice(start, start + this.postsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilter();
  }

  filterByStatus(status: string): void {
    this.currentFilter = status;
    this.currentPage = 1;
    this.applyFilter();
  }

  get totalPages(): number[] {
    const totalCount =
      this.currentFilter === 'ALL'
        ? this.allPosts.length
        : this.allPosts.filter(p => p.postStatus === this.currentFilter).length;

    return Array.from(
      { length: Math.ceil(totalCount / this.postsPerPage) },
      (_, i) => i + 1
    );
  }

  navigateToEdit(postId: number): void {
    // navigate via path param so route matches
    this.router.navigate(['/learner', 'edit-post', postId]);
  }

  confirmDelete(postId: number): void {
    if (window.confirm('Are you sure you want to delete this post?')) {
      this.deletePost(postId);
    }
  }

  deletePost(postId: number): void {
    this.http
      .delete(
        `http://localhost:8080/api/posts/${postId}`,
        { withCredentials: true, responseType: 'text' }
      )
      .subscribe({
        next: msg => {
          this.allPosts = this.allPosts.filter(p => p.postId !== postId);
          this.applyFilter();
          alert(msg || 'Post deleted successfully.');
        },
        error: err => {
          console.error('Delete failed:', err);
          alert('Could not delete post: ' + (err.error || err.message));
        }
      });
  }
}
