import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetCartComponent } from './projet-cart-component';

describe('ProjetCartComponent', () => {
  let component: ProjetCartComponent;
  let fixture: ComponentFixture<ProjetCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjetCartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjetCartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
