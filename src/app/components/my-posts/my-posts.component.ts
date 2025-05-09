import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Post {
  postId: number;
  postStatus: string;
  category: string;
  subject: string;
  content: string;
  price: number;
}

@Component({
  standalone: false,
  selector: 'app-my-posts',
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
        this.allPosts = posts;
        this.applyFilter();
      });
  }

  applyFilter(): void {
    let filtered =
      this.currentFilter === 'ALL'
        ? this.allPosts
        : this.allPosts.filter(
            (post) => post.postStatus === this.currentFilter
          );

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
    const totalFiltered =
      this.currentFilter === 'ALL'
        ? this.allPosts.length
        : this.allPosts.filter((p) => p.postStatus === this.currentFilter)
            .length;

    return Array.from(
      { length: Math.ceil(totalFiltered / this.postsPerPage) },
      (_, i) => i + 1
    );
  }

  navigateToEdit(postId: number): void {
    this.router.navigate(['/learner/edit-post'], {
      queryParams: { id: postId },
    });
  }

  confirmDelete(postId: number): void {
    const confirm = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (confirm) {
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
        this.allPosts = this.allPosts.filter((p) => p.postId !== postId);
        this.applyFilter();
      });
  }
}
