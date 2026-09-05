import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../Model/Utilisateur';
import { Equipe } from '../Model/Equipe';

@Component({
  selector: 'app-equipes-list-component',
  imports: [CommonModule],
  templateUrl: './equipes-list-component.html',
  styleUrl: './equipes-list-component.css',
})
export class EquipesListComponent {
   @Input() equipes: Equipe[] = [];

  private palette = ['#3A7CA5', '#5FA8D3', '#7BAE7F', '#C97B84', '#8E7CC3', '#D4A574'];

  getInitiales(membre: Utilisateur): string {
    const p = membre.prenom?.[0] ?? '';
    const n = membre.nom?.[0] ?? '';
    return (p + n).toUpperCase() || n.toUpperCase();
  }

  getColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.palette.length;
    return this.palette[index];
  }
}
