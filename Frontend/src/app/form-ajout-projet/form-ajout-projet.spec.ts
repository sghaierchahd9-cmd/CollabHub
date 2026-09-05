import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAjoutProjet } from './form-ajout-projet';

describe('FormAjoutProjet', () => {
  let component: FormAjoutProjet;
  let fixture: ComponentFixture<FormAjoutProjet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAjoutProjet],
    }).compileComponents();

    fixture = TestBed.createComponent(FormAjoutProjet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
