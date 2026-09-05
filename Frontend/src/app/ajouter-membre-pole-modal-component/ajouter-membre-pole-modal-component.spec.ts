import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterMembrePoleModalComponent } from './ajouter-membre-pole-modal-component';

describe('AjouterMembrePoleModalComponent', () => {
  let component: AjouterMembrePoleModalComponent;
  let fixture: ComponentFixture<AjouterMembrePoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjouterMembrePoleModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AjouterMembrePoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
