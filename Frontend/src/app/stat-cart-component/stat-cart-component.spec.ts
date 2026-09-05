import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatCartComponent } from './stat-cart-component';

describe('StatCartComponent', () => {
  let component: StatCartComponent;
  let fixture: ComponentFixture<StatCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatCartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
