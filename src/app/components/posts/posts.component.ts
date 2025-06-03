import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

// Documented By Tamer

// Interface Type definition
interface Post {
  postId: number;
  authorId: number;
  authorName: string;
  authorImage?: string;
  approvalDate: string;
  price: number;
  subject: string;
  content: string;
  postStatus: string;
  category: string;
  sessionDeadline: string;
  agreementSent?: boolean;
}

@Component({
  selector: 'app-posts',
  standalone: false,
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
})
export class PostsComponent implements OnInit {
  // Variables
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

  // Constructor with Injected Values for use...
  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * If the user is not logged in, it navigates to the login page.
   * Otherwise, it fetches the posts from the server and applies the current filter.
   * @memberof PostsComponent
   */
  ngOnInit(): void {
    if (!this.authService.userData) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchPosts();
  }

  /**
   * Fetches the posts from the server and applies the current filter.
   * If the user is not logged in, it navigates to the login page.
   * Otherwise, it sends an HTTP GET request to the server and subscribes to the response.
   * On success, it updates the posts array and calls the applyFilters method
   * to filter the posts according to the current filter.
   * On error, it logs the error to the console and displays an appropriate error message.
   * If the error is a 401 Unauthorized response, it navigates to the login page.
   * @memberof PostsComponent
   */
  fetchPosts() {
    this.isLoading = true;
    this.errorMessage = '';

    const role = this.authService.userData.role;
    const url = `https://learn-bridge-back-end.onrender.com/api/posts/${
      role === 'ADMIN' ? 'all-posts' : 'favourite-category'
    }`;

    this.http.get<Post[]>(url, { withCredentials: true }).subscribe({
      next: (posts: Post[]) => {
        // backend now returns authorImage as a data-URL
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

  /**
   * Handles the event of a user typing in the search input.
   * Trims and lowercases the input value and assigns it to the searchQuery property.
   * Calls the applyFilters method to filter the posts according to the new search query.
   * @param event The event object containing the input element.
   * @memberof PostsComponent
   */
  handleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.trim().toLowerCase();
    this.applyFilters();
  }

  /**
   * Applies the current filter to the posts and updates the displayed posts.
   * The current filter is applied in the following steps:
   * 1. Remove expired posts (posts with a session deadline before today).
   * 2. Filter the remaining posts to only include posts that match the search query
   *    in their subject (case insensitive).
   * 3. Filter the remaining posts to only include posts with a price that matches
   *    the selected price filter.
   * 4. Sort the remaining posts by price in the order specified by the sort order.
   * The filtered and sorted posts are then assigned to the `filteredPosts` property
   * and the pagination is updated using the `paginatePosts` method.
   * @memberof PostsComponent
   */
  applyFilters() {
    const today = new Date();
    let result = [...this.allPosts];

    result = result.filter((post) => new Date(post.sessionDeadline) >= today);

    if (this.searchQuery) {
      result = result.filter((post) =>
        post.subject.toLowerCase().includes(this.searchQuery)
      );
    }

    result = result.filter((post) => {
      if (this.selectedPrice === 'Less than 20') return post.price < 20;
      if (this.selectedPrice === '20') return post.price === 20;
      if (this.selectedPrice === 'More than 20') return post.price > 20;
      return true;
    });

    result.sort((a, b) =>
      this.sortOrder === 'Ascending' ? a.price - b.price : b.price - a.price
    );

    this.filteredPosts = result;
    this.currentPage = 1;
    this.paginatePosts();
  }

  /**
   * Changes the current page of the posts to the given page number.
   * The `paginatePosts` method is called to update the displayed posts
   * according to the new page number.
   * @param page The page number to change to.
   * @memberof PostsComponent
   */
  changePage(page: number) {
    this.currentPage = page;
    this.paginatePosts();
  }

  /**
   * Paginates the filtered posts according to the current page number.
   * The posts are sliced to include only those within the current page.
   * The `paginatedPosts` property is updated with the paginated posts.
   */
  paginatePosts() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedPosts = this.filteredPosts.slice(
      start,
      start + this.pageSize
    );
  }

  /**
   * Confirms with the user whether they wish to teach the learner of the given post.
   * If confirmed, sends an HTTP POST request to the server to create an agreement
   * between the current user and the learner.
   * If the request fails, displays an alert with an appropriate error message.
   * @param post The post for which to send the agreement request.
   */
  confirmAgreement(post: Post) {
    const confirmed = window.confirm(
      `Are you sure you wish to teach this learner?`
    );
    if (!confirmed) return;

    const learnerId = post.authorId;
    const postId = post.postId;
    if (!learnerId || !postId) return;

    this.http
      .post(
        `https://learn-bridge-back-end.onrender.com/api/agreements/request/${learnerId}/${postId}`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          post.agreementSent = true;
        },
        error: (err) => {
          console.error('Agreement request failed:', err);
          alert('Failed to send agreement. Please try again.');
        },
      });
  }
}
