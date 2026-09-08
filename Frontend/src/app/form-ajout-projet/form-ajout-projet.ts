import { UtilisateurService } from './../utilisateur-service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoginService } from '../login-service';
import { Utilisateur } from '../Model/Utilisateur';
import { FormControl, FormGroup, NgForm, ɵInternalFormsSharedModule ,FormBuilder,Validators,ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';
import { NgIf } from '@angular/common';
import { Equipe } from '../Model/Equipe';
import { EquipeService } from '../equipe-service';




@Component({
  selector: 'app-form-ajout-projet',
  templateUrl: './form-ajout-projet.html',
  styleUrls: ['./form-ajout-projet.css'],
  imports: [NgClass, NgIf, ɵInternalFormsSharedModule, NgFor,ReactiveFormsModule]
})
export class FormAjoutProjet implements OnInit {
  @Input() isOpen: boolean = false;
  @Output() isClosed = new EventEmitter<void>();       
  @Output() projetCree = new EventEmitter<any>();       

  form: FormGroup;

  priorites = ['BASSE', 'MOYENNE', 'HAUTE'];
  mapPrioriteDesign: Record<string, string> = {
    'BASSE': 'border-green-200 bg-green-50 text-green-700 ring-1 ring-green-400',
    'MOYENNE': 'border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-400',
    'HAUTE': 'border-orange-200 bg-orange-50 text-orange-700 ring-1 ring-orange-400',
  };

  status = ['PLANIFIER', 'EN_COURS'];
  mapStatutDesign: Record<string, string> = {
    'PLANIFIER': 'bg-purple-100 text-purple-700',
    'EN_COURS': 'bg-blue-100 text-blue-700',
  };

  chefsProjets: Utilisateur[] = [];
  equipes: Equipe[] = [];
  loggedinPerson: Utilisateur | null;

  // Sélection multiple des membres 
  membresSelectionnes = new Set<number>();

  constructor(
    private fb: FormBuilder,
    private serviceLogin: LoginService,
    private utilisateurService: UtilisateurService,
    private equipeService: EquipeService,
  ) {
    this.loggedinPerson = this.serviceLogin.loggedIUser;

    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      objectifs: [''],
      dateDebut: ['', Validators.required],
      dateFinPrevue: ['', Validators.required],
      niveauPriorite: ['Moyenne', Validators.required],
      statut: ['Planifié', Validators.required],
      chefProjet: [this.loggedinPerson?.role === 'CHEF_PROJET' ? this.loggedinPerson.id :null, Validators.required],
    });
  }
   
  ngOnInit(): void {
     this.utilisateurService.getUtilisateursByrole('CHEF_PROJET').subscribe({
      next: data => this.chefsProjets = data.map(json => Utilisateur.fromJson(json)),
      error: () => console.log('une erreur est survenue'),
    });

    this.equipeService.getequipes().subscribe({
      next: data => {
        this.equipes = data.map(json => Equipe.fromJson(json));
        console.log("equipes form d'ajout  : ", this.equipes);
        this.equipes.forEach(equipe => {
          this.utilisateurService.getmembersEquipe(equipe.id).subscribe({
            next: data => equipe.members = data.map(json => Utilisateur.fromJson(json)).filter(u => u.role != 'CHEF_PROJET'),
            error: () => console.log('une erreur est survenue'),
          });
        });
      },
    });
  }

 
  selectPriorite(priorite: string): void {
   
    this.form.patchValue({ niveauPriorite: priorite });
  }

  selectStatut(statut: string): void {
    this.form.patchValue({ statut });
  }

  selectChef(chef: any): void {
    this.form.patchValue({ chefProjet: chef.id });
  }
  champInvalide(nomChamp: string): boolean {
  const champ = this.form.get(nomChamp);
  return !!champ && champ.invalid && champ.touched;
}

  // --- Sélection multiple : le Set ---
  toggleMembre(id: number): void {
    if (this.membresSelectionnes.has(id)) {
      this.membresSelectionnes.delete(id);
    } else {
      this.membresSelectionnes.add(id);
    }
  }

  fermerForm(): void {
    this.isClosed.emit();
  }

  soumettre(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    

    const payload = {
      ...this.form.value,                                
      collaborateurIds: Array.from(this.membresSelectionnes),
    };
    console.log('payload : ', payload);
    this.projetCree.emit(payload);
  
    
  }

}