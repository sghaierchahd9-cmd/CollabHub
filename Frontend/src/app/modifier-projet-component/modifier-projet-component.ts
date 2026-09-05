
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Projet, StatutProjet } from '../Model/Projet' ;
import { Utilisateur } from '../Model/Utilisateur';
import { Equipe } from '../Model/Equipe';
import { UtilisateurService } from '../utilisateur-service';
export type ProjetPayload = Omit<Projet, 'id' | 'dateCreation' | 'estArchive'>;

@Component({
  selector: 'app-modifier-projet-component',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './modifier-projet-component.html',
  styleUrl: './modifier-projet-component.css',
})

export class ModifierProjetComponent implements OnChanges {

  @Input() isOpen = false;
  @Input() projet: Projet | null = null;
  @Input() equipes: Equipe[] = [];
   chefsProjets: Utilisateur[] = [];
  @Input() loggedinPerson: Utilisateur | null = null;
  @Input() enregistrementEnCours = false;
  @Input() erreurMessage: string | null = null;
  equipesFiltrees : Equipe[]=[];

  @Output() fermer = new EventEmitter<void>();
  @Output() enregistrer = new EventEmitter<ProjetPayload>();

  priorites = ['BASSE', 'MOYENNE', 'HAUTE'];

  statuts: StatutProjet[] = ['PLANIFIER', 'EN_COURS', 'SUSPENDU', 'TERMINE', 'ARCHIVE'];

  mapPrioriteDesign: Record<string, string> = {
    BASSE: 'bg-green-50 text-green-700 border-green-200',
    MOYENNE: 'bg-orange-50 text-orange-700 border-orange-200',
    HAUTE: 'bg-red-50 text-red-700 border-red-200'
  };

  mapStatutDesign: Record<StatutProjet, string> = {
    PLANIFIER: 'bg-gray-100 text-gray-700',
    EN_COURS: 'bg-blue-600 text-white',
    SUSPENDU: 'bg-orange-500 text-white',
    TERMINE: 'bg-green-600 text-white',
    ARCHIVE: 'bg-gray-500 text-white'
  };

  membresSelectionnes = new Set<number>();
  form: FormGroup;

  constructor(private fb: FormBuilder,private userService:UtilisateurService) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      objectifs: [''],
      dateDebut: ['', Validators.required],
      dateFinPrevue: ['', Validators.required],
      niveauPriorite: ['MOYENNE'],
      statut: ['PLANIFIER' as StatutProjet],
      chefProjet: [null as number | null]
    });
    this.userService.getUtilisateursByrole("CHEF_PROJET").subscribe((data)=>{
      this.chefsProjets=data.map(json=> Utilisateur.fromJson(json));
    }
  
     )
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.equipes.forEach(e=>
      e.members=e.members.filter(m => m.role != "CHEF_PROJET")
    )
    // Pré-remplissage uniquement à l'ouverture
    if (changes['isOpen'] && this.isOpen && this.projet) {
      this.preRemplirFormulaire(this.projet);
    }
  }

  private preRemplirFormulaire(projet: Projet): void {
    this.form.reset();
    this.form.patchValue({
      nom: projet.nom,
      description: projet.description,
      objectifs: projet.objectifs,
      dateDebut: this.formatDateInput(projet.dateDebut),
      dateFinPrevue: this.formatDateInput(projet.dateFinPrevue),
      niveauPriorite: projet.niveauPriorite,
      statut: projet.statut,
      chefProjet: projet.chefProjet
    });

    // collaborateurIds est déjà un number[]
    this.membresSelectionnes = new Set(projet.collaborateurIds ?? []);
  }

  private formatDateInput(date: string): string {
   
    return date ? date.substring(0, 10) : '';
  }

  champInvalide(champ: string): boolean {
    const control = this.form.get(champ);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  selectPriorite(priorite: string): void {
    this.form.patchValue({ niveauPriorite: priorite });
  }

  selectStatut(statut: StatutProjet): void {
    this.form.patchValue({ statut });
  }

  selectChef(chef: Utilisateur): void {
    this.form.patchValue({ chefProjet: chef.id });
  }

  toggleMembre(id: number): void {
    if (this.membresSelectionnes.has(id)) {
      this.membresSelectionnes.delete(id);
    } else {
      this.membresSelectionnes.add(id);
    }
  }

  soumettre(): void {
    // le chef de projet n'est requis que pour un ADMINISTRATEUR (seul rôle qui voit le champ)
    if (this.loggedinPerson?.role === 'ADMINISTRATEUR' && !this.form.value.chefProjet) {
      this.form.get('chefProjet')?.setErrors({ required: true });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: ProjetPayload = {
      nom: this.form.value.nom,
      description: this.form.value.description,
      objectifs: this.form.value.objectifs,
      dateDebut: this.form.value.dateDebut,
      dateFinPrevue: this.form.value.dateFinPrevue,
      niveauPriorite: this.form.value.niveauPriorite,
      statut: this.form.value.statut,
      chefProjet: this.form.value.chefProjet,
      collaborateurIds: Array.from(this.membresSelectionnes)
    };

    this.enregistrer.emit(payload);
  }

  fermerForm(): void {
    this.fermer.emit();
  }
}
