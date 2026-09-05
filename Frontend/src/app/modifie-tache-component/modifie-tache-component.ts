import { Component, Input, Output, EventEmitter, OnInit  } from '@angular/core';
import { Utilisateur } from '../Model/Utilisateur';
import { Tache, StatutTache, PrioriteTache } from '../Model/tache';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modifie-tache-component',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './modifie-tache-component.html',
  styleUrl: './modifie-tache-component.css',
})
export class ModifieTacheComponent {
   @Input() tache!: Tache;
  @Input() equipeProjet: Utilisateur[] = [];
  @Input() succes = false;

  @Output() fermer = new EventEmitter<void>();
  @Output() tacheModifiee = new EventEmitter<{ id: number; requete: any }>();

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
  private collaborateursIds = new Set<number>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: [''],
      priorite: ['MOYENNE' as PrioriteTache, Validators.required],
      statut: ['A_FAIRE' as StatutTache, Validators.required],
      echeance: ['', Validators.required]
    });

    this.dateMin = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    // Pré-remplissage avec les données actuelles de la tâche
    this.form.patchValue({
      titre: this.tache.titre,
      description: this.tache.description,
      priorite: this.tache.priorite,
      statut: this.tache.statut,
      echeance: this.tache.echeance
    });
     this.collaborateursIds = new Set<number>(
    ( [])
  );
  }
  


toggleCollaborateur(collaborateur: Utilisateur): void {
  if (this.collaborateursIds.has(collaborateur.id)) {
    this.collaborateursIds.delete(collaborateur.id);
  } else {
    this.collaborateursIds.add(collaborateur.id);
  }
}

estSelectionne(collaborateur: Utilisateur): boolean {
  return this.collaborateursIds.has(collaborateur.id);
}

get aucunCollaborateurSelectionne(): boolean {
  return this.collaborateursIds.size === 0;
}

onSubmit(): void {
  this.form.markAllAsTouched();

  if (this.form.invalid || this.aucunCollaborateurSelectionne) {
    return;
  }

  const requete = {
    ...this.form.value,
    collaborateurs: Array.from(this.collaborateursIds).map(id => ({ id }))
    // ou juste Array.from(this.collaborateursIds) si le backend attend un tableau d'ids
  };

  this.tacheModifiee.emit({ id: this.tache.id, requete });
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


  onAnnuler(): void {
    this.fermer.emit();
  }

  onClose(): void {
    this.fermer.emit();
  }
}




