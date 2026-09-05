import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../Model/Utilisateur';

@Component({
  selector: 'app-ajouter-membre-pole-modal-component',
  imports: [CommonModule,FormsModule],
  templateUrl: './ajouter-membre-pole-modal-component.html',
  styleUrl: './ajouter-membre-pole-modal-component.css',
})
export class AjouterMembrePoleModalComponent {




  @Input() isOpen = false;
  @Input() utilisateursEligibles: Utilisateur[] = [];
  @Input() enCours = false;
  @Input() erreur: string | null = null;
  @Output() soumettre = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  selectedId: number | null = null;

  onSubmit(): void {
    if (this.selectedId == null) return;
    this.soumettre.emit(this.selectedId);
  }

  onClose(): void {
    this.selectedId = null;
    this.close.emit();
  }
}