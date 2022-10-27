/**
 * @author Edgar Butwilowski
 * @copyright Copyright (c) Vermessungsamt Winterthur. All rights reserved.
 */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PlaygroundService } from './playgrounds.service';

describe('PlaygroundsService', () => {
  let service: PlaygroundService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ // only modules go here
        RouterTestingModule, HttpClientTestingModule ]
    });
    service = TestBed.inject(PlaygroundService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
