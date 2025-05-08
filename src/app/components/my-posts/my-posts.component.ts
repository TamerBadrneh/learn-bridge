import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  templateUrl: './my-posts.component.html',
  styleUrls: ['./my-posts.component.scss'],
  standalone : false
})
export class MyPostsComponent implements OnInit {
  allPosts: Post[] = [];
  displayedPosts: Post[] = [];
  currentPage: number = 1;
  postsPerPage: number = 3;
  currentFilter: string = 'ALL';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  fetchPosts(): void {
    this.http.get<Post[]>('http://localhost:8080/api/posts/my-posts', { withCredentials: true })
      .subscribe(posts => {
        this.allPosts = posts;
        this.applyFilter();
      });
  }

  applyFilter(): void {
    let filtered = this.currentFilter === 'ALL'
      ? this.allPosts
      : this.allPosts.filter(post => post.postStatus === this.currentFilter);

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
    const totalFiltered = this.currentFilter === 'ALL'
      ? this.allPosts.length
      : this.allPosts.filter(p => p.postStatus === this.currentFilter).length;

    return Array.from({ length: Math.ceil(totalFiltered / this.postsPerPage) }, (_, i) => i + 1);
  }
}
