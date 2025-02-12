import { TestBed } from '@angular/core/testing';

import { MultimodalLiveService } from './gemini-client.service';

describe('GeminiClientService', () => {
  let service: MultimodalLiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultimodalLiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
