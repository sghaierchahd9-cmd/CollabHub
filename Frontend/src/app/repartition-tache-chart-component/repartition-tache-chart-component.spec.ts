import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartitionTacheChartComponent } from './repartition-tache-chart-component';

describe('RepartitionTacheChartComponent', () => {
  let component: RepartitionTacheChartComponent;
  let fixture: ComponentFixture<RepartitionTacheChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepartitionTacheChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RepartitionTacheChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
