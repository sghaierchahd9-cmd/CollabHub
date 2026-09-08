import { Component,Output,Input, EventEmitter } from '@angular/core';
import { Utilisateur } from '../Model/Utilisateur';
import { Tache } from '../Model/tache';
import { StatutTache ,PrioriteTache} from '../Model/tache';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-tache-component',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add-tache-component.html',
  styleUrl: './add-tache-component.css',
})
export class AddTacheComponent {
    @Input() equipeProjet: Utilisateur[] = [];
  @Input() projetId!: number;


  @Output() fermer = new EventEmitter<void>();
  @Output() tacheCreee = new EventEmitter<Tache>();

 
  readonly statuts: { valeur: StatutTache; label: string }[] = [
    { valeur: 'A_FAIRE', label: 'À faire' },
    { valeur: 'EN_COURS', label: 'En cours' },
    { valeur: 'BLOQUEE', label: 'Bloquée' },
    { valeur: 'TERMINEE', label: 'Terminée' }
  ];

  readonly priorites: { valeur: PrioriteTache; label: string; emoji: string }[] = [
    { valeur: 'HAUTE', label: 'Haute', emoji: '🔴' },
    { valeur: 'MOYENNE', label: 'Moyenne', emoji: '🟡' },
    { valeur: 'BASSE', label: 'Basse', emoji: '🟢' }
  ];

  private readonly couleursAvatar = ['#3a7ca5', '#2f6690', '#5a9bc4'];

  form: FormGroup;
  dateMin: string;
@Input() succes = false; 
 
  private collaborateurs = new Set<Utilisateur>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      priorite: ['MOYENNE' as PrioriteTache, Validators.required],
      statut: ['A_FAIRE' as StatutTache, Validators.required],
      echeance: ['', Validators.required]
    });

    this.dateMin = new Date().toISOString().split('T')[0]; // 'yyyy-MM-dd'
  }

  toggleCollaborateur(collaborateur:Utilisateur): void {
    if (this.collaborateurs.has(collaborateur)) {
      this.collaborateurs.delete(collaborateur);
    } else {
      this.collaborateurs.add(collaborateur);
    }
  }

  estSelectionne(collaborateur: Utilisateur): boolean {
    return this.collaborateurs.has(collaborateur);
  }

  get aucunCollaborateurSelectionne(): boolean {
    return this.collaborateurs.size === 0;
  }

  initiales(u: Utilisateur): string {
    return `${u.prenom?.[0] ?? ''}${u.nom?.[0] ?? ''}`.toUpperCase();
  }

  couleurAvatar(id: number): string {
    return this.couleursAvatar[id % this.couleursAvatar.length];
  }

  get titreInvalide(): boolean {
    const c = this.form.get('titre');
    return !!c && c.invalid && c.touched;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

  
    if (this.form.invalid || this.aucunCollaborateurSelectionne) {
      return;
    }

    const requete: Tache = {
      ...this.form.value,
      dateDebut: null,
      projetId: this.projetId,
      collaborateurs: Array.from(this.collaborateurs)
    };
   console.log(requete);
    this.tacheCreee.emit(requete);
  }

  onAnnuler(): void {
    this.fermer.emit();
  }
   onClose(): void {
    this.fermer.emit();
  }
}
