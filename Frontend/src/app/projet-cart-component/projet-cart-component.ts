import { Component, OnInit } from '@angular/core';
import { Projet } from '../Model/Projet';
import { Input ,Pipe} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Utilisateur } from '../Model/Utilisateur';
import { ProjetService } from '../projet-service';
import { Tache } from '../Model/tache';

@Component({
  selector: 'app-projet-cart-component',
  imports: [CommonModule],
  templateUrl: './projet-cart-component.html',
  styleUrl: './projet-cart-component.css',
})
export class ProjetCartComponent implements OnInit {
  @Input() projet :Projet=new Projet();
  members: Utilisateur[] = [];
  PrioriteDesign: string = 'rounded-2xl px-2 py-1 text-xs font-semibold';
  statutDesign: string = 'rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap';
  avancement :Number = 0;

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    const projetId = this.projet?.id;

    if (projetId === undefined || projetId === null) {
      return;
    }
    this.projetService.getMembers(projetId).subscribe({
      next: (data) => {
        this.members = data.map((json) => Utilisateur.fromJson(json));
        console.log('Members:', this.members);
      },
      error: (err) => console.error(err),
    
    
    });
  
     if (this.projet?.niveauPriorite === 'HAUTE'){
        this.PrioriteDesign = this.PrioriteDesign + ' bg-[#AB3535] text-white';
      } 
      else if (this.projet?.niveauPriorite === 'MOYENNE') {
        this.PrioriteDesign = this.PrioriteDesign + ' bg-[#FFF3B0] text-black';
      } 
      else if (this.projet?.niveauPriorite === 'BASSE') {
        this.PrioriteDesign = this.PrioriteDesign + ' bg-[#8BBD82] text-white';
      }
    if (this.projet?.statut === 'EN_COURS'){
        this.statutDesign = this.statutDesign + ' bg-[#7CA3BF] text-white';
      } 
      else if (this.projet?.statut === 'TERMINE') {
        this.statutDesign = this.statutDesign + ' bg-[#8BBD82] text-white';
      } 
      else if (this.projet?.statut === 'PLANIFIER') {
        this.statutDesign = this.statutDesign + ' bg-[#FFF3B0] text-black';
      }
      else if (this.projet?.statut === 'ARCHIVE') {
        this.statutDesign = this.statutDesign + ' bg-[#CCCCCC] text-white';
      }
      else if (this.projet?.statut === 'SUSPENDU') {
        this.statutDesign = this.statutDesign + ' bg-[#EF4444] text-white';
      }
      this.projetService.getTaches(projetId).subscribe({
        next: (data) => {
          const taches = data.map((json) => Tache.fromJson(json));
          const totalTaches = taches.length;
          let avancementSomme =0;
          taches.forEach(t => avancementSomme += Number(t.tauxAvancement));
          this.avancement = totalTaches > 0 ? Math.round((avancementSomme/ totalTaches) ) : 0;
          console.log('Avancement:', this.avancement);
        },
        error: (err) => console.error(err),
      });

  }
}
