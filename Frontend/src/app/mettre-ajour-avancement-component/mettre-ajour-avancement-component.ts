import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Tache } from '../Model/tache';

@Component({
  selector: 'app-mettre-ajour-avancement-component',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './mettre-ajour-avancement-component.html',
  styleUrl: './mettre-ajour-avancement-component.css',
})
export class MettreAjourAvancementComponent {

  @Input() isOpen = false;
  @Input() tache: Tache | null = null;
  @Input() enregistrementEnCours = false;
  @Input() erreurMessage: string | null = null;

  @Output() fermer = new EventEmitter<void>();
  @Output() enregistrer = new EventEmitter<number>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      tauxAvancement: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen && this.tache) {
      this.form.patchValue({ tauxAvancement: this.tache.tauxAvancement ?? 0 });
    }
  }

  get suggererTerminee(): boolean {
    return this.form.value.tauxAvancement === 100 && this.tache?.statut !== 'TERMINEE';
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enregistrer.emit(this.form.value.tauxAvancement);
  }

  fermerForm(): void {
    this.fermer.emit();
  }
}