import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnerOfferComponent } from './learner-offer.component';

describe('LearnerOfferComponent', () => {
  let component: LearnerOfferComponent;
  let fixture: ComponentFixture<LearnerOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LearnerOfferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearnerOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
