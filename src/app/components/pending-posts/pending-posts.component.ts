import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Post {
  postId: number;
  authorId: number;
  authorName: string;
  approvalDate: string | null;
  price: number;
  subject: string;
  content: string;
  postStatus: string;
  category: string;
  sessionDeadline: string;   // ← new
}

@Component({
  selector: 'app-pending-posts',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pending-posts.component.html',
  styleUrls: ['./pending-posts.component.scss'],
})
export class PendingPostsComponent implements OnInit {
  posts: Post[] = [];
  currentPage = 1;
  postsPerPage = 3;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchPendingPosts();
  }

  fetchPendingPosts() {
    this.http
      .get<Post[]>('http://localhost:8080/api/posts/pending-posts', {
        withCredentials: true,
      })
      .subscribe((data) => (this.posts = data));
  }

  get paginatedPosts(): Post[] {
    const start = (this.currentPage - 1) * this.postsPerPage;
    return this.posts.slice(start, start + this.postsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  totalPages(): number {
    return Math.ceil(this.posts.length / this.postsPerPage);
  }

  acceptPost(authorId: number, postId: number) {
    this.http
      .put(
        `http://localhost:8080/api/posts/accept/${authorId}/${postId}`,
        null,
        { withCredentials: true }
      )
      .subscribe(() => window.location.reload());
  }

  rejectPost(authorId: number, postId: number) {
    this.http
      .put(
        `http://localhost:8080/api/posts/reject/${authorId}/${postId}`,
        null,
        { withCredentials: true }
      )
      .subscribe(() => window.location.reload());
  }
}
