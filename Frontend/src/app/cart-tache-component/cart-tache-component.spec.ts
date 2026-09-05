import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartTacheComponent } from './cart-tache-component';

describe('CartTacheComponent', () => {
  let component: CartTacheComponent;
  let fixture: ComponentFixture<CartTacheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartTacheComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CartTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
