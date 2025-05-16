import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-find-instructor',
  standalone: false,
  templateUrl: './find-instructor.component.html',
  styleUrl: './find-instructor.component.scss',
})
export class FindInstructorComponent implements OnInit {
  searchKeyword: string = '';
  instructors: any[] = [];
  allInstructors: any[] = [];

  selectedCategory: string = '';
  selectedSortOrder: string = '';
  selectedPrice: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 3;
  paginatedInstructors: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchInstructors();
  }

  fetchInstructors() {
    const url = 'http://localhost:8080/api/instructors/find-favourite';

    this.http.get<any[]>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allInstructors = response.map((inst) => ({
          id: inst.instructorId,
          fullName: `${inst.firstName} ${inst.lastName}`,
          university: inst.universityInfo,
          bio: inst.bio,
          hourRate: inst.avgPrice,
          rating: inst.ratingAvg,
          reviewsCount: inst.numberOfReviews,
          sessionsCount: inst.numberOfSessions,
          image:
            inst.image ||
            'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg',
        }));
        console.log(this.allInstructors);
        this.filterInstructors();
      },
      error: (err) => {
        console.error('Error fetching favourite instructors:', err);
        this.allInstructors = [];
        this.filterInstructors();
      },
    });
  }

  filterInstructors() {
    const keyword = this.searchKeyword.toLowerCase().trim();

    let filtered = this.allInstructors.filter((instructor) => {
      const matchesName = instructor.fullName.toLowerCase().includes(keyword);

      let matchesPrice = true;
      if (this.selectedPrice === 'Less than 20 JD') {
        matchesPrice = instructor.hourRate < 20;
      } else if (this.selectedPrice === '20 JD') {
        matchesPrice = instructor.hourRate === 20;
      } else if (this.selectedPrice === 'More than 20 JD') {
        matchesPrice = instructor.hourRate > 20;
      }

      return matchesName && matchesPrice;
    });

    if (this.selectedSortOrder === 'asc') {
      filtered.sort((a, b) => a.sessionsCount - b.sessionsCount);
    } else if (this.selectedSortOrder === 'desc') {
      filtered.sort((a, b) => b.sessionsCount - a.sessionsCount);
    }

    this.instructors = filtered;
    this.currentPage = 1;
    this.paginate();
  }

  onCategoryChange() {
    if (!this.selectedCategory) {
      this.fetchInstructors();
      return;
    }

    const url = `http://localhost:8080/api/instructors/${this.selectedCategory}`;

    this.http.get<any[]>(url, { withCredentials: true }).subscribe({
      next: (response) => {
        this.allInstructors = response.map((inst) => ({
          fullName: `${inst.firstName} ${inst.lastName}`,
          university: inst.universityInfo,
          bio: inst.bio,
          hourRate: inst.avgPrice,
          rating: inst.ratingAvg,
          reviewsCount: inst.numberOfReviews,
          sessionsCount: inst.numberOfSessions,
          image:
            inst.image ||
            'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg',
        }));
        this.filterInstructors();
      },
      error: (err) => {
        console.error('Error fetching instructors by category:', err);
        this.allInstructors = [];
        this.filterInstructors();
      },
    });
  }

  paginate() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedInstructors = this.instructors.slice(start, end);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.paginate();
  }

  get totalPages(): number[] {
    return Array(Math.ceil(this.instructors.length / this.itemsPerPage))
      .fill(0)
      .map((_, i) => i + 1);
  }

  viewInstructorProfile(id: number): void {
    this.router.navigate([`/learner/${id}/view-profile`]);
  }
}
