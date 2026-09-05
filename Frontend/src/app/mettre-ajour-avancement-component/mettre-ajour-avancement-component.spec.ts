import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MettreAjourAvancementComponent } from './mettre-ajour-avancement-component';

describe('MettreAjourAvancementComponent', () => {
  let component: MettreAjourAvancementComponent;
  let fixture: ComponentFixture<MettreAjourAvancementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MettreAjourAvancementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MettreAjourAvancementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
