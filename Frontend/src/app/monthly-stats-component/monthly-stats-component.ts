import { Component, Input, OnChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { MonthlyStats } from '../Model/Monthlystats';

@Component({
  selector: 'app-monthly-stats-component',
  imports: [BaseChartDirective],
  templateUrl: './monthly-stats-component.html',
  styleUrl: './monthly-stats-component.css',
   template: `
    <canvas baseChart
      [data]="barChartData"
      [options]="barChartOptions"
      [type]="'bar'">
    </canvas>
  `
})
export class MonthlyStatsComponent implements  OnChanges  {

  @Input() data: MonthlyStats[] = [];

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Complétées', backgroundColor: '#3A7CA5', borderRadius: 4, borderSkipped: false, barThickness: 12 },
      { data: [], label: 'Créées', backgroundColor: '#d4e9f5', borderRadius: 4, borderSkipped: false, barThickness: 12 }
    ]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7f8e', font: { size: 12 } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#e8eef3' },
        ticks: { color: '#6b7f8e', font: { size: 12 } }
      }
    }
  };

  ngOnChanges() {
    this.barChartData = {
      labels: this.data.map(d => d.month),
      datasets: [
        { ...this.barChartData.datasets[0], data: this.data.map(d => d.completed) },
        { ...this.barChartData.datasets[1], data: this.data.map(d => d.created) }
      ]
    };
  }
}
 