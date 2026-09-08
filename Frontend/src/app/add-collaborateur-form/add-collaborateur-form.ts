
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ɵɵDir } from "@angular/cdk/scrolling";


@Component({
  selector: 'app-add-collaborateur-form',
  imports: [CommonModule, ReactiveFormsModule, ɵɵDir],
  templateUrl: './add-collaborateur-form.html',
  styleUrl: './add-collaborateur-form.css',
})
export class AddCollaborateurForm implements OnChanges {
   @Input() equipes: any[] = [];       
  @Input() enCours = false;           
  @Input() erreur: string | null = null;
  @Input() succes = false;   
  @Input() isOpen =false;         

  @Output() close = new EventEmitter<void>();
  @Output() soumettre = new EventEmitter<any>(); 
  form: FormGroup;
  motDePasseVisible = false;
  motDePasseAffiche = '';
  emailAffiche = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['COLLABORATEUR', Validators.required],
      modeTravail: ['SUR_SITE', Validators.required],
      equipeIds: [[] as number[]]
    });
  }

  // Réagit quand le parent confirme le succès (après réponse du backend)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['succes']?.currentValue === true) {
     
      this.emailAffiche = this.form.value.email;
      this.resetFormulaire();
    }
  }

  
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
   
   
    this.soumettre.emit(this.form.value); 
    
  }

  
  onClose(): void {
    this.close.emit();
    this.resetFormulaire();
  }
  equipesSelectionnees = new Set<number>();

toggleEquipe(id: number): void {
  if (this.equipesSelectionnees.has(id)) {
    this.equipesSelectionnees.delete(id);
  } else {
    this.equipesSelectionnees.add(id);
  }
 
  this.form.get('equipeIds')?.setValue(Array.from(this.equipesSelectionnees));
}

estSelectionnee(id: number): boolean {
  return this.equipesSelectionnees.has(id);
}


private resetFormulaire(): void {
  this.form.reset({
    role: 'COLLABORATEUR',        
    modeDeTravail: 'SUR_SITE',
  });
  this.equipesSelectionnees.clear();
     
}
}