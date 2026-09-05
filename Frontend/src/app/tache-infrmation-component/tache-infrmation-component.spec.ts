import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacheInfrmationComponent } from './tache-infrmation-component';

describe('TacheInfrmationComponent', () => {
  let component: TacheInfrmationComponent;
  let fixture: ComponentFixture<TacheInfrmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TacheInfrmationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TacheInfrmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
