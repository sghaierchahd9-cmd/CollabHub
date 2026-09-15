import { TestBed } from '@angular/core/testing';

import { ResumeIaService } from './resume-ia-service';

describe('ResumeIaService', () => {
  let service: ResumeIaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResumeIaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
