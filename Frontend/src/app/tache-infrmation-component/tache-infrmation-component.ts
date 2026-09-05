import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tache, PrioriteTache } from '../Model/tache';
import { Utilisateur } from '../Model/Utilisateur';


@Component({
  selector: 'app-tache-infrmation-component',
  imports: [],
  templateUrl: './tache-infrmation-component.html',
  styleUrl: './tache-infrmation-component.css',
})
export class TacheInfrmationComponent {
   @Input() tache!: Tache;

  @Output() fermer = new EventEmitter<void>();

  private readonly couleursAvatar = ['#3a7ca5', '#2f6690', '#5a9bc4'];

  private readonly prioriteLabels: Record<PrioriteTache, { label: string; emoji: string }> = {
    HAUTE: { label: 'Haute', emoji: '🔴' },
    MOYENNE: { label: 'Moyenne', emoji: '🟡' },
    BASSE: { label: 'Basse', emoji: '🟢' }
  };

  get prioriteAffichee() {
    return this.prioriteLabels[this.tache.priorite];
  }

  get tauxArrondi(): number {
    return Math.round(Number(this.tache.tauxAvancement ?? 0));
  }

  get aAucunCollaborateur(): boolean {
    return !this.tache.collaborateurs || this.tache.collaborateurs.length === 0;
  }

  initiales(u: Utilisateur): string {
    return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase();
  }

  couleurAvatar(id: number): string {
    return this.couleursAvatar[id % this.couleursAvatar.length];
  }

  formatDate(date: string | undefined | null): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  onClose(): void {
    this.fermer.emit();
  }
}
