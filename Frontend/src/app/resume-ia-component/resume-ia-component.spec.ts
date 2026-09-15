import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeIaComponent } from './resume-ia-component';

describe('ResumeIaComponent', () => {
  let component: ResumeIaComponent;
  let fixture: ComponentFixture<ResumeIaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeIaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeIaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
