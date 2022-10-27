import { TestBed } from '@angular/core/testing';

import { DefectService } from './defect.service';

describe('DefectService', () => {
  let service: DefectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
