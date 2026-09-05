import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentaireInputComponent } from './commentaire-input-component';

describe('CommentaireInputComponent', () => {
  let component: CommentaireInputComponent;
  let fixture: ComponentFixture<CommentaireInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommentaireInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentaireInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
