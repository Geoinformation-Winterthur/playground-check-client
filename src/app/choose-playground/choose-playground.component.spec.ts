import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoosePlaygroundComponent } from './choose-playground.component';

describe('ChoosePlaygroundComponent', () => {
  let component: ChoosePlaygroundComponent;
  let fixture: ComponentFixture<ChoosePlaygroundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoosePlaygroundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoosePlaygroundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
