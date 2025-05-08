import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-find-instructor',
  standalone: false,
  templateUrl: './find-instructor.component.html',
  styleUrl: './find-instructor.component.scss'
})
export class FindInstructorComponent implements OnInit {
  searchKeyword: string = '';
  instructors: any[] = [];
  allInstructors: any[] = [];

  selectedCategory: string = '';
  selectedSortOrder: string = '';
  selectedPrice: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchInstructors();
  }

  fetchInstructors() {
    this.allInstructors = [
      {
        fullName: 'Ahmad Nasser',
        university: 'Jordan University',
        bio: 'Experienced software engineering tutor with 5+ years of teaching experience',
        hourRate: 15,
        rating: 4.8,
        reviewsCount: 24,
        sessionsCount: 56,
        image: 'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg'
      },
      {
        fullName: 'Layla Mahmoud',
        university: 'PSUT',
        bio: 'Cyber security expert with practical experience in the field',
        hourRate: 20,
        rating: 4.9,
        reviewsCount: 18,
        sessionsCount: 42,
        image: 'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg'
      }
    ];

    this.filterInstructors();

    const url = 'http://localhost:8080/api/instructors';

    this.http.get<any[]>(url).subscribe({
      next: (response) => {
        this.allInstructors = response.map((inst: any) => ({
          fullName: `${inst.firstName} ${inst.lastName}`,
          university: inst.universityInfo,
          bio: inst.bio,
          hourRate: inst.avgPrice,
          rating: inst.ratingAvg,
          reviewsCount: inst.numberOfReviews,
          sessionsCount: inst.numberOfSessions,
          image: 'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg'
        }));

        this.filterInstructors();
      },
      error: (err) => {
        console.error('Error fetching instructors:', err);
      }
    });
  }


  filterInstructors() {
    const keyword = this.searchKeyword.toLowerCase().trim();

    let filtered = this.allInstructors.filter(instructor => {
      const matchesName = instructor.fullName.toLowerCase().includes(keyword);

      let matchesPrice = true;
      if (this.selectedPrice === 'Less than 10 JD') {
        matchesPrice = instructor.hourRate < 10;
      } else if (this.selectedPrice === '10 JD') {
        matchesPrice = instructor.hourRate === 10;
      } else if (this.selectedPrice === 'More than 10 JD') {
        matchesPrice = instructor.hourRate > 10;
      }

      return matchesName && matchesPrice;
    });

    if (this.selectedSortOrder === 'asc') {
      filtered.sort((a, b) => a.sessionsCount - b.sessionsCount);
    } else if (this.selectedSortOrder === 'desc') {
      filtered.sort((a, b) => b.sessionsCount - a.sessionsCount);
    }

    this.instructors = filtered;
  }

  onCategoryChange() {
    if (!this.selectedCategory) {
      this.fetchInstructors();
      return;
    }

    const url = `http://localhost:8080/api/instructors/${this.selectedCategory}`; 

    this.http.get<any[]>(url).subscribe({
      next: (response) => {
        this.allInstructors = response.map((inst: any) => ({
          fullName: `${inst.firstName} ${inst.lastName}`,
          university: inst.universityInfo,
          bio: inst.bio,
          hourRate: inst.avgPrice,
          rating: inst.ratingAvg,
          reviewsCount: inst.numberOfReviews,
          sessionsCount: inst.numberOfSessions,
          image: 'https://staudt-gmbh.com/wp-content/uploads/2018/07/person-dummy.jpg'
        }));

        this.filterInstructors();
      },
      error: (err) => {
        console.error('Error fetching by category:', err);
      }
    });

    
  }
}
