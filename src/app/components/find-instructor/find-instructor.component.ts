import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-find-instructor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './find-instructor.component.html',
  styleUrls: ['./find-instructor.component.scss'],
})
export class FindInstructorComponent implements OnInit {
  searchKeyword = '';
  instructors: any[] = [];
  allInstructors: any[] = [];

  selectedCategory = '';
  selectedSortOrder = '';
  selectedPrice = '';

  currentPage = 1;
  itemsPerPage = 3;
  paginatedInstructors: any[] = [];

  defaultPlaceholder =
    'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchInstructors();
  }

  fetchInstructors() {
    this.http
      .get<any[]>(
        'https://learn-bridge-back-end.onrender.com/api/instructors/find-favourite',
        { withCredentials: true }
      )
      .subscribe({
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
            image: inst.personalImage || this.defaultPlaceholder,
          }));
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
    let filtered = this.allInstructors.filter((i) => {
      const matchesName = i.fullName.toLowerCase().includes(keyword);
      let matchesPrice = true;
      if (this.selectedPrice === 'Less than 20 JD') {
        matchesPrice = i.hourRate < 20;
      } else if (this.selectedPrice === '20 JD') {
        matchesPrice = i.hourRate === 20;
      } else if (this.selectedPrice === 'More than 20 JD') {
        matchesPrice = i.hourRate > 20;
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

    this.http
      .get<any[]>(
        `https://learn-bridge-back-end.onrender.com/api/instructors/${this.selectedCategory}`,
        { withCredentials: true }
      )
      .subscribe({
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
            image: inst.personalImage || this.defaultPlaceholder,
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
    this.paginatedInstructors = this.instructors.slice(
      start,
      start + this.itemsPerPage
    );
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

  viewInstructorProfile(id: number) {
    this.router.navigate([`/learner/${id}/view-profile`]);
  }
}
