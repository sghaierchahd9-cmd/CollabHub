import { Component,Input,Output } from '@angular/core';
import { Tache } from '../Model/tache';
import { Utilisateur} from '../Model/Utilisateur';
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail-membre-projet-component',
  imports: [CommonModule],
  templateUrl: './detail-membre-projet-component.html',
  styleUrl: './detail-membre-projet-component.css',
})
export class DetailMembreProjetComponent {
  @Input() membre!: Utilisateur;
  @Input() taches: Tache[] = [];
  @Output() fermer = new EventEmitter<void>();

  readonly statutLabels: Record<string, string> = {
    A_FAIRE: 'À faire',
    EN_COURS: 'En cours',
    TERMINEE: 'Terminée',
    BLOQUEE: 'Bloquée'
  };

  readonly statutColors: Record<string, string> = {
    A_FAIRE: 'bg-slate-100 text-slate-600',
    EN_COURS: 'bg-blue-100 text-blue-700',
    TERMINEE: 'bg-green-100 text-green-700',
    BLOQUEE: 'bg-red-100 text-red-700'
  };

  get nbTerminees(): number {
    return this.taches.filter(t => t.statut === 'TERMINEE').length;
  }

  get progression(): number {
    return this.taches.length === 0
      ? 0
      : Math.round((this.nbTerminees / this.taches.length) * 100);
  }

  onClose(): void {
    this.fermer.emit();
  }
}
