import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifieTacheComponent } from './modifie-tache-component';

describe('ModifieTacheComponent', () => {
  let component: ModifieTacheComponent;
  let fixture: ComponentFixture<ModifieTacheComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifieTacheComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifieTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
