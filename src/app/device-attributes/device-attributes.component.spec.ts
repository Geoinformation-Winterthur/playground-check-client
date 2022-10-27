import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceAttributesComponent } from './device-attributes.component';

describe('DeviceAttributesComponent', () => {
  let component: DeviceAttributesComponent;
  let fixture: ComponentFixture<DeviceAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
