import { TestBed } from '@angular/core/testing';

import { GetCovidDataService } from './get-covid-data.service';

describe('GetCovidDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GetCovidDataService = TestBed.get(GetCovidDataService);
    expect(service).toBeTruthy();
  });
});
