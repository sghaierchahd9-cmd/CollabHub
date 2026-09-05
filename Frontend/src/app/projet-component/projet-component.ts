import { LoginService } from './../login-service';
import { Component } from '@angular/core';
import { Projet } from '../Model/Projet';
import { ProjetService } from '../projet-service';
import { ProjetCartComponent } from "../projet-cart-component/projet-cart-component";
import { SidebarComponent } from "../sidebar-component/sidebar-component";
import { HeaderComponent } from "../header-component/header-component";
import {CommonModule} from "@angular/common";
import {StatCartComponent} from "../stat-cart-component/stat-cart-component";
import { Utilisateur } from '../Model/Utilisateur';
import { FormAjoutProjet } from "../form-ajout-projet/form-ajout-projet";
import { ProjetDetailComponent } from "../projet-detail-component/projet-detail-component";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-projet-component',
  imports: [ProjetCartComponent, CommonModule, SidebarComponent, HeaderComponent, StatCartComponent, FormAjoutProjet, RouterLink],
  templateUrl: './projet-component.html',
  styleUrl: './projet-component.css',
})
export class ProjetComponent {
  projets :Projet[] = [];
  selectedprojets :Projet[] = [];
  connectedUser : Utilisateur ;
  addProjet : boolean = false ;
  openForm : boolean = false ;
  selectedprojet :Projet | null=null;

  // si je veux ajouter un autre critere ou statut il faut juste l'ajouter dans le tableau filtres et dans le map statutMap et styleMap
  statCartes = [
    { titre: 'En cours', valeur: 0 ,style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"},
    { titre: 'Terminés', valeur: 0 ,style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"},
    { titre: 'Planifiés', valeur: 0, style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold" },
    { titre: 'Suspendus', valeur: 0, style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold" }
  ];
  filtres =['Tous', 'En cours', 'Terminés', 'Planifiés', 'Suspendus'];
  private statutMap: Record<string, string> = {
  'En cours': 'EN_COURS',
  'Terminés': 'TERMINE',
  'Planifiés': 'PLANIFIER',
  'Suspendus': 'SUSPENDU'
};
 private styleMap: Record<string, string> = {
  'En cours': 'text-[#3B82F6]',
  'Terminés': 'text-[#10B981]',
  'Planifiés': 'text-[#F59E0B]',
  'Suspendus': 'text-[#EF4444]'
};
  selectedFiltre = 'Tous';
  constructor(private projetService: ProjetService,private loginService: LoginService,private router : Router ) {
    this.connectedUser = this.loginService.loggedIUser as Utilisateur;
  }
  chargerProjet(){
    this.projetService.getProjet().subscribe(
      (data: Projet[]) => {
        this.projets = data.map(json => Projet.fromJson(json));
        console.log('Projets fetched successfully:', this.projets);
        this.selectedprojets = this.projets;
         this.statCartes.forEach(carte => {
          const statut = this.statutMap[carte.titre];
          carte.valeur = this.projets.filter(projet => projet.statut === statut).length;
          carte.style =carte.style + ' ' + (this.styleMap[carte.titre] || '');
        });
      },
      (error :any) => {
        console.error('Error fetching projets:', error);
      });
      

  }

  ngOnInit() {
      this.chargerProjet();
      console.log('Projets after filtering:', this.projets);
      console.log('selectedFiltre:', this.selectedFiltre);
      console.log('connectedUser:', this.connectedUser);
      
    }
    selectFiltre(filtre: string): void {
      this.selectedFiltre = filtre;
      this.selectedprojets = filtre === 'Tous' ? this.projets : this.projets.filter(projet => projet.statut === this.statutMap[filtre]);
      console.log('Projets after filtering:', this.projets);
      console.log('selectedFiltre:', this.selectedFiltre);
    }

onActionButtonClick(event:any){
  if ((this.connectedUser.role === 'ADMINISTRATEUR') || (this.connectedUser.role === 'CHEF_PROJET') ){
    this.addProjet= true ;
    console.log(this.addProjet);
      

  }

}
fermerForm(event:any): void{
  this.addProjet= false;
}
submitForm(form :any){
  this.projetService.postProjet(form).subscribe({
     next: (projetCree) => {
      console.log('Projet créé avec succès', projetCree);
      this.fermerForm(true);
      this.chargerProjet();
      // ex: fermer le modal, rafraîchir la liste des projets, afficher un toast...
    },
    error: (err) => {
      console.error('Erreur lors de la création du projet', err);
      // ex: afficher un message d'erreur à l'utilisateur
    }
});
 
  
}
selectProjet(projet:Projet):void{
this.router.navigate(['/projets/',projet.id]);
}

}
