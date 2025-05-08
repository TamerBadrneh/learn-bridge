import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  tutorImagePath: string = './assets/images/backImg.jpg';

  constructor() { }

  ngOnInit(): void {
  }
}
