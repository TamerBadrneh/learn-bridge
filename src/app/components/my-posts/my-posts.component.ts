import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

interface Post {
  postId: number;
  postStatus: string;
  category: string;
  subject: string;
  content: string;
  price: number;
}

@Component({
  selector: 'app-my-posts',
  standalone: true,
  imports: [
    CommonModule,      // for *ngIf, *ngFor, etc.
    RouterModule,      // if you use [routerLink] or router.navigate()
    HttpClientModule,  // for HttpClient
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
        withCredentials: true,
      })
      .subscribe((posts) => {
        // Immediately filter out ON_HOLD posts
        this.allPosts = posts.filter(p => p.postStatus !== 'ON_HOLD');
        this.applyFilter();
      });
  }

  applyFilter(): void {
    // 1. Apply status filter (‘ALL’ shows everything except on-hold)
    let filtered =
      this.currentFilter === 'ALL'
        ? this.allPosts
        : this.allPosts.filter(p => p.postStatus === this.currentFilter);

    // 2. Paginate
    const start = (this.currentPage - 1) * this.postsPerPage;
    const end = this.currentPage * this.postsPerPage;
    this.displayedPosts = filtered.slice(start, end);
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
    const post = this.allPosts.find(p => p.postId === postId);
    if (post) {
      localStorage.setItem('editPostData', JSON.stringify(post));
      this.router.navigate(['/learner/edit-post'], {
        queryParams: { id: postId },
      });
    }
  }

  confirmDelete(postId: number): void {
    if (window.confirm('Are you sure you want to delete this post?')) {
      this.deletePost(postId);
    }
  }

  deletePost(postId: number): void {
    this.http
      .delete(`http://localhost:8080/api/posts/${postId}`, {
        withCredentials: true,
        responseType: 'text',
      })
      .subscribe(() => {
        // Remove from allPosts and re-apply filter/pagination
        this.allPosts = this.allPosts.filter(p => p.postId !== postId);
        this.applyFilter();
      });
  }
}
