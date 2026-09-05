import { Component, OnInit,OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Input } from '@angular/core';
import { Subscribable, Subscription } from 'rxjs';
import { ActivityNotificationService } from '../activity-notification-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-repartition-tache-chart-component',
  standalone: true,
  imports: [BaseChartDirective,CommonModule],
  templateUrl: './repartition-tache-chart-component.html',
  styleUrl: './repartition-tache-chart-component.css',
})
export class RepartitionTacheChartComponent implements OnInit, OnChanges {
  @Input() labels: string[] = [];
  @Input() Data: number[] = [];
  @Input() colors: string[] = [];
  @Input() title : string ='';
  private sub?: Subscription;

  
  constructor(private notifService: ActivityNotificationService){}
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 4 }]
  };

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed} `
        }
      }
    }
  };

  ngOnInit() {
    this.buildChartData();
    this.sub=this.notifService.refresh$.subscribe(()=>{
    this.buildChartData();});
  }

  ngOnChanges() {
    this.buildChartData();
  }

  private buildChartData() {
    this.doughnutChartData = {
      labels: this.labels,
      datasets: [{
        data: this.Data,
        backgroundColor: this.colors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
   
  }
}