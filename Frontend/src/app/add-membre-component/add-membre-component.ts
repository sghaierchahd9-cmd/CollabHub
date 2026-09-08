
import { Component, EventEmitter, Input, Output, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipe } from '../Model/Equipe';
import { Utilisateur } from '../Model/Utilisateur';



@Component({
  selector: 'app-add-membre-component',
  imports: [CommonModule],
  templateUrl: './add-membre-component.html',
  styleUrl: './add-membre-component.css',
})
export class AddMembreComponent implements OnChanges ,OnInit{
    @Input() isOpen = false;
  @Input() equipes: Equipe[] = [];
  @Input() membresDejaAjoutes: number[] = [];
  @Input() chefId : number =0; // IDs déjà dans le projet, à exclure de la liste

  @Output() close = new EventEmitter<void>();
  @Output() confirmer = new EventEmitter<number[]>();

  membresSelectionnes = new Set<number>();
  equipesFiltrees: Equipe[] = [];
 ngOnInit(): void {
      
 }
  ngOnChanges() {
    // On retire les membres déjà présents dans le projet à chaque ouverture
    this.equipesFiltrees = this.equipes.map(equipe => {
    const nouvelleEquipe = new Equipe();
    nouvelleEquipe.id = equipe.id;
    nouvelleEquipe.nom = equipe.nom;
    nouvelleEquipe.description = equipe.description;
    nouvelleEquipe.dateCreation = equipe.dateCreation;
    nouvelleEquipe.dateSupression = equipe.dateSupression;
    nouvelleEquipe.members = equipe.members.filter(m => !this.membresDejaAjoutes.includes(m.id) && m.id != this.chefId && m.role !='CHEF_PROJET');
    
 
    return nouvelleEquipe; 
    });
   
  }

  toggleMembre(id: number) {
    if (this.membresSelectionnes.has(id)) {
      this.membresSelectionnes.delete(id);
    } else {
      this.membresSelectionnes.add(id);
    }
  }

  onFermer() {
    this.membresSelectionnes.clear();
    this.close.emit();
  }

  onConfirmer() {
    this.confirmer.emit(Array.from(this.membresSelectionnes));
    this.membresSelectionnes.clear();
  }
}
