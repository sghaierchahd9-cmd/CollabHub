import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaceCollaboratifProjetComponent } from './espace-collaboratif-projet-component';

describe('EspaceCollaboratifProjetComponent', () => {
  let component: EspaceCollaboratifProjetComponent;
  let fixture: ComponentFixture<EspaceCollaboratifProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaceCollaboratifProjetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EspaceCollaboratifProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
