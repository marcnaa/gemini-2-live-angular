import { TestBed } from '@angular/core/testing';

import { ScreenCaptureService } from './screen-capture.service';

describe('ScreenCaptureService', () => {
  let service: ScreenCaptureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenCaptureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
