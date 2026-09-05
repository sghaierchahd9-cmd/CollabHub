import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoleFormModalComponent } from './pole-form-modal-component';

describe('PoleFormModalComponent', () => {
  let component: PoleFormModalComponent;
  let fixture: ComponentFixture<PoleFormModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoleFormModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PoleFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
