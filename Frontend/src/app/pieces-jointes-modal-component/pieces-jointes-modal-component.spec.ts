import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PiecesJointesModalComponent } from './pieces-jointes-modal-component';

describe('PiecesJointesModalComponent', () => {
  let component: PiecesJointesModalComponent;
  let fixture: ComponentFixture<PiecesJointesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PiecesJointesModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PiecesJointesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
