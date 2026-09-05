import { UtilisateurService } from './../utilisateur-service';
import { Component } from '@angular/core';
import { Tache } from '../Model/tache';
import { TacheService } from '../tache-service';
import { Input ,Output} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { StatCartComponent } from "../stat-cart-component/stat-cart-component";
import { CommonModule, NgFor } from '@angular/common';
import { SidebarComponent } from "../sidebar-component/sidebar-component";
import { HeaderComponent } from "../header-component/header-component";
import { Utilisateur } from '../Model/Utilisateur';
import { CartTacheComponent } from "../cart-tache-component/cart-tache-component";
import { KanbanComponent } from '../kanban-component/kanban-component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-taches-component',
  imports: [StatCartComponent, CommonModule, NgFor, SidebarComponent, HeaderComponent, CartTacheComponent,KanbanComponent],
  templateUrl: './taches-component.html',
  styleUrl: './taches-component.css',
})

export class TachesComponent {
  taches : Tache[] = [];
  cartes =[
    {titre: 'Total taches',
    valeur: 0,
    style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"
    },
    {titre: 'A faire',
    valeur: 0,
    style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#F59E0B]"},
    {titre: 'En cours',
    valeur: 0,
    style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#3B82F6] "},
    {titre: 'Terminée',
    valeur: 0,
    style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#10B981]"},
    {titre: 'Bloquée',
    valeur: 0,
    style:"font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#EF4444]"}

  ]
   tacheStatuts : string[] = ['Total','A_FAIRE', 'EN_COURS', 'TERMINEE', 'BLOQUEE'];
   statusStyles: Record<string, string> = {
  'À faire':   'bg-slate-300',
  'En cours':  'bg-blue-500',
  'Terminé':   'bg-green-500'
};

  @Output() tacheCounts = new EventEmitter<number[]>();
  @Output() tachesemit = new EventEmitter<Tache[]>();
  
  constructor(private tacheService: TacheService , private UtilisateurService :UtilisateurService,private router :Router) {}
  ngOnInit() {
    this.tacheService.getTaches().subscribe((data) => {
     this.taches = data.map((tacheData: any) => Tache.fromJson(tacheData));
      this.cartes[0].valeur = this.taches.length;
     for (let i = 1; i < this.tacheStatuts.length; i++) {
      this.cartes[i].valeur = this.CalculTacheParStatut(this.tacheStatuts[i]);
     }
   
   this.tachesemit.emit(this.taches);
     console.log('Taches:', this.taches);
    
    });
   
  }

  public CalculTacheParStatut(statut : string): number {
    return (this.taches.filter(tache => tache.statut === statut)).length;

  }
  statchange(){
   this.tacheService.getTaches().subscribe((data) => {
     this.taches = data.map((tacheData: any) => Tache.fromJson(tacheData));
      this.cartes[0].valeur = this.taches.length;
     for (let i = 1; i < this.tacheStatuts.length; i++) {
      this.cartes[i].valeur = this.CalculTacheParStatut(this.tacheStatuts[i]);
     }

  })
  
    
}
selectTache(tache:Tache){
  this.router.navigate(['/projets/',tache.projetId]);
}
}
