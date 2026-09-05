import { TestBed } from '@angular/core/testing';

import { PieceJointeService } from './piece-jointe-service';

describe('PieceJointeService', () => {
  let service: PieceJointeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PieceJointeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
