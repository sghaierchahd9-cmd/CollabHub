import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-stat-cart-component',
  imports: [],
  templateUrl: './stat-cart-component.html',
  styleUrl: './stat-cart-component.css',
})
export class StatCartComponent {
  @Input() carte = {
    titre: '',
    valeur: 0,
    style:''
  };

}
