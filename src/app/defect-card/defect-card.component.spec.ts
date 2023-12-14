import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefectCardComponent } from './defect-card.component';

describe('DefectCardComponent', () => {
  let component: DefectCardComponent;
  let fixture: ComponentFixture<DefectCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefectCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DefectCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
