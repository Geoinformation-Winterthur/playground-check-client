/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { InspectionService } from './inspection.service';

describe('InspectionService', () => {
  let service: InspectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ // only modules go here
        HttpClientTestingModule ]
    });
    service = TestBed.inject(InspectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
