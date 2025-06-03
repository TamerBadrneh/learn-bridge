import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Documented By Tamer

// Interface Type definition...
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
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.scss'],
})
export class MyPostsComponent implements OnInit {
  // Data Members
  allPosts: Post[] = [];
  displayedPosts: Post[] = [];
  currentPage = 1;
  postsPerPage = 3;
  currentFilter = 'ALL';

  // Constructor with Injected Values for use...
  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Lifecycle hook that is called after data-bound properties are initialized.
   * It fetches the user's posts from the server and applies the current filter.
   */
  ngOnInit(): void {
    this.fetchPosts();
  }

  /**
   * Fetches the user's posts from the server and applies the current filter.
   * The http request is sent with the 'withCredentials' flag set to true,
   * meaning that the browser will send cookies with the request.
   * On success, the posts are filtered to remove any with status 'ON_HOLD'
   * and the current filter is applied.
   * On error, an error message is logged to the console.
   */
  fetchPosts(): void {
    this.http
      .get<Post[]>('https://learn-bridge-back-end.onrender.com/api/posts/my-posts', {
        withCredentials: true,
      })
      .subscribe(
        (posts) => {
          this.allPosts = posts.filter((p) => p.postStatus !== 'ON_HOLD');
          this.applyFilter();
        },
        (err) => {
          console.error('Could not fetch posts', err);
        }
      );
  }

  /**
   * Applies the current filter to the user's posts and updates the displayed posts.
   * The current filter is either 'ALL' or one of the post statuses.
   * The posts are filtered to only include posts with the current filter.
   * The displayed posts are then updated to include only the filtered posts
   * that are within the current page.
   */
  applyFilter(): void {
    const filtered =
      this.currentFilter === 'ALL'
        ? this.allPosts
        : this.allPosts.filter((p) => p.postStatus === this.currentFilter);

    // Pagination Logic using slice array function.
    const start = (this.currentPage - 1) * this.postsPerPage;
    this.displayedPosts = filtered.slice(start, start + this.postsPerPage);
  }

  /**
   * Changes the current page of the posts to the given page number.
   * The `applyFilter` method is called to update the displayed posts
   * according to the new page number.
   * @param page The page number to change to.
   */
  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilter();
  }

  /**
   * Updates the current filter status and resets the page number.
   *
   * This method sets the `currentFilter` to the specified `status`
   * and resets the `currentPage` to 1. It then applies the filter
   * to update the displayed posts based on the new status.
   *
   * @param status The status to filter posts by (e.g., 'ALL', 'ACCEPTED', 'PENDING', 'REJECTED').
   */

  filterByStatus(status: string): void {
    this.currentFilter = status;
    this.currentPage = 1;
    this.applyFilter();
  }

  /**
   * Computes the total number of pages based on the current filter and
   * number of posts per page.
   *
   * The method returns an array representing the page numbers. The length
   * of the array is determined by dividing the total number of posts that
   * match the current filter by the number of posts per page, rounded up
   * to the nearest integer.
   *
   * @returns {number[]} An array of page numbers.
   */

  get totalPages(): number[] {
    const totalCount =
      this.currentFilter === 'ALL'
        ? this.allPosts.length
        : this.allPosts.filter((p) => p.postStatus === this.currentFilter)
            .length;

    return Array.from(
      { length: Math.ceil(totalCount / this.postsPerPage) },
      (_, i) => i + 1
    );
  }

  /**
   * Navigates to the edit page for the specified post.
   *
   * This method constructs a route using the provided post ID
   * and navigates to the edit post page. The post ID is passed
   * as a path parameter to ensure the route matches.
   *
   * @param postId The ID of the post to be edited.
   */

  navigateToEdit(postId: number): void {
    // navigate via path param so route matches
    this.router.navigate(['/learner', 'edit-post', postId]);
  }

  /**
   * Prompts the user to confirm deletion of a post and deletes it if confirmed.
   * The user is prompted with a confirmation dialog box with a message asking
   * if they are sure they want to delete the post. If the user clicks 'OK',
   * the post is deleted by calling the `deletePost` method.
   * @param postId The ID of the post to be deleted.
   */
  confirmDelete(postId: number): void {
    if (window.confirm('Are you sure you want to delete this post?')) {
      this.deletePost(postId);
    }
  }

  /**
   * Deletes a post by sending an HTTP DELETE request to the server.
   * After deletion, the method filters the posts to exclude the deleted post
   * and updates the pagination. If the deletion fails, it displays an alert
   * with an appropriate error message.
   * @param postId The ID of the post to be deleted.
   */
  deletePost(postId: number): void {
    this.http
      .delete(`https://learn-bridge-back-end.onrender.com/api/posts/${postId}`, {
        withCredentials: true,
        responseType: 'text',
      })
      .subscribe({
        next: (msg) => {
          this.allPosts = this.allPosts.filter((p) => p.postId !== postId);
          this.applyFilter();
          alert(msg || 'Post deleted successfully.');
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Could not delete post: ' + (err.error || err.message));
        },
      });
  }
}
