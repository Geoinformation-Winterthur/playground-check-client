import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionCriterionComponent } from './inspection-criterion.component';

describe('InspectionCriterionComponent', () => {
  let component: InspectionCriterionComponent;
  let fixture: ComponentFixture<InspectionCriterionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectionCriterionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InspectionCriterionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
