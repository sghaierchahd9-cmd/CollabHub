import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarteMenmbreComponent } from './carte-menmbre-component';

describe('CarteMenmbreComponent', () => {
  let component: CarteMenmbreComponent;
  let fixture: ComponentFixture<CarteMenmbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarteMenmbreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarteMenmbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
