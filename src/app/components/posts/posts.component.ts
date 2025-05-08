import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  standalone: false,
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {
  posts: any[] = [];
  filteredPosts: any[] = [];
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedPrice: string = 'All Prices';
  sortOrder: string = 'Ascending';
  currentPage: number = 1;
  pageSize: number = 4;
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
    
    const userRole = this.authService.userData?.role;
   

    this.http.get(`http://localhost:8080/api/posts/favourite-category`, {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        this.posts = response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching posts:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load posts. ';
        
        if (error.status === 401) {
          this.errorMessage += 'Please login again.';
          this.router.navigate(['/login']);
        } else {
          this.errorMessage += 'Please try again later.';
        }
      }
    });
  }

  applyFilters() {
    let result = [...this.posts];

    if (this.searchQuery) {
      result = result.filter(post =>
        post.subject.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedCategory) {
      result = result.filter(post => post.category === this.selectedCategory);
    }

    result = result.filter(post => {
      if (this.selectedPrice === 'Less than 10 JD') return post.price < 10;
      if (this.selectedPrice === '10 JD') return post.price === 10;
      if (this.selectedPrice === 'More than 10 JD') return post.price > 10;
      return true;
    });

    result.sort((a, b) =>
      this.sortOrder === 'Ascending' ? a.price - b.price : b.price - a.price
    );

    this.filteredPosts = result;
  }

  handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    this.applyFilters();
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  get paginatedPosts() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPosts.slice(start, start + this.pageSize);
  }
}