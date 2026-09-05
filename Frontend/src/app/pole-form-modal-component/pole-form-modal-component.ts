import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipe } from '../Model/Equipe';


@Component({
  selector: 'app-pole-form-modal-component',
  imports: [CommonModule,FormsModule],
  templateUrl: './pole-form-modal-component.html',
  styleUrl: './pole-form-modal-component.css',
})
export class PoleFormModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() pole: Equipe | null = null; // null = création
  @Input() enCours = false;
  @Input() erreur: string | null = null;
  @Output() soumettre = new EventEmitter<{ nom: string; description: string }>();
  @Output() close = new EventEmitter<void>();

  nom = '';
  description = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.nom = this.pole?.nom ?? '';
      this.description = this.pole?.description ?? '';
      console.log('ajouter pole !!')
    }
  }

  get modeEdition(): boolean {
    return this.pole !== null;
  }

  onSubmit(): void {
    if (!this.nom.trim()) return;
    this.soumettre.emit({ nom: this.nom.trim(), description: this.description.trim() });
  }

  onClose(): void {
    this.close.emit();
  }
}