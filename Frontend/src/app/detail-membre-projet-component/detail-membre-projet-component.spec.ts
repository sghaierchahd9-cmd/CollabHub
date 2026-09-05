import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailMembreProjetComponent } from './detail-membre-projet-component';

describe('DetailMembreProjetComponent', () => {
  let component: DetailMembreProjetComponent;
  let fixture: ComponentFixture<DetailMembreProjetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailMembreProjetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailMembreProjetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
