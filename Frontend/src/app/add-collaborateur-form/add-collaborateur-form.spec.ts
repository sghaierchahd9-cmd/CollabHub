import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollaborateurForm } from './add-collaborateur-form';

describe('AddCollaborateurForm', () => {
  let component: AddCollaborateurForm;
  let fixture: ComponentFixture<AddCollaborateurForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollaborateurForm],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCollaborateurForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
