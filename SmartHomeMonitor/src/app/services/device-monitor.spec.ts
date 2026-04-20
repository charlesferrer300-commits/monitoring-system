import { TestBed } from '@angular/core/testing';

import { DeviceMonitor } from './device-monitor';

describe('DeviceMonitor', () => {
  let service: DeviceMonitor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceMonitor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
