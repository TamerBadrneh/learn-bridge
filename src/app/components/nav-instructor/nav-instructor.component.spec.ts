import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavInstructorComponent } from './nav-instructor.component';

describe('NavInstructorComponent', () => {
  let component: NavInstructorComponent;
  let fixture: ComponentFixture<NavInstructorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavInstructorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavInstructorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
