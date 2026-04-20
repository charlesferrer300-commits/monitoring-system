import { TestBed } from '@angular/core/testing';

import { Siren } from './siren';

describe('Siren', () => {
  let service: Siren;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Siren);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
