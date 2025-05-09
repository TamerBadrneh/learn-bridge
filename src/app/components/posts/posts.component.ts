import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

interface Post {
  postId: number;
  authorId: number;
  authorName: string;
  approvalDate: string;
  price: number;
  subject: string;
  content: string;
  postStatus: string;
  category: string;
}

@Component({
  standalone: false,
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
  allPosts: Post[] = [];
  filteredPosts: Post[] = [];
  paginatedPosts: Post[] = [];

  searchQuery: string = '';
  selectedPrice: string = 'All Prices';
  sortOrder: string = 'Ascending';

  currentPage: number = 1;
  pageSize: number = 3;

  isLoading: boolean = false;
  errorMessage: string = '';
  Math = Math;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.userData) {
      this.router.navigate(['/login']);
      return;
    }

    this.fetchPosts();
  }

  fetchPosts() {
    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .get<Post[]>('http://localhost:8080/api/posts/favourite-category', {
        withCredentials: true,
      })
      .subscribe({
        next: (posts: Post[]) => {
          this.allPosts = posts;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching posts:', error);
          this.isLoading = false;
          this.errorMessage = 'Failed to load posts.';
          if (error.status === 401) {
            this.errorMessage += ' Please login again.';
            this.router.navigate(['/login']);
          } else {
            this.errorMessage += ' Please try again later.';
          }
        },
      });
  }

  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.trim().toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.allPosts];

    // Filter by search
    if (this.searchQuery) {
      result = result.filter((post) =>
        post.subject.toLowerCase().includes(this.searchQuery)
      );
    }

    // Filter by price
    result = result.filter((post) => {
      if (this.selectedPrice === 'Less than 20') return post.price < 20;
      if (this.selectedPrice === '20') return post.price === 20;
      if (this.selectedPrice === 'More than 20') return post.price > 20;
      return true;
    });

    // Sort
    result.sort((a, b) =>
      this.sortOrder === 'Ascending' ? a.price - b.price : b.price - a.price
    );

    this.filteredPosts = result;
    this.currentPage = 1;
    this.paginatePosts();
  }

  changePage(page: number) {
    this.currentPage = page;
    this.paginatePosts();
  }

  paginatePosts() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedPosts = this.filteredPosts.slice(
      start,
      start + this.pageSize
    );
  }
}
