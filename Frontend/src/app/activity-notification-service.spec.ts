import { TestBed } from '@angular/core/testing';

import { ActivityNotificationService } from './activity-notification-service';

describe('ActivityNotificationService', () => {
  let service: ActivityNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
