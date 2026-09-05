import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtilisateurService } from '../utilisateur-service';
import { Utilisateur } from '../Model/Utilisateur';
import { StatutCollab,StatutCollabConfig } from '../Model/StatutCollab';
import { Tache } from '../Model/tache';
import { Projet } from '../Model/Projet';
import { TacheService } from '../tache-service';
import { ProjetService } from '../projet-service';
import { NotificationSocketService } from '../notification-socket-service';
import { AvatarComponent } from "../avatar-component/avatar-component";
interface StatutConfig {
  label: string;
  dotClass: string;   // couleur du point
  textClass: string;  // couleur du texte
}

export const STATUT_ACTIVITE_CONFIG: Record<StatutCollab | 'NULL', StatutConfig> = {
  DISPONIBLE:  { label: 'Disponible', dotClass: 'bg-green-500',  textClass: 'text-green-600' },

  EN_REUNION:  { label: 'En réunion', dotClass: 'bg-violet-500', textClass: 'text-violet-600' },
  EN_PAUSE:    { label: 'En pause',   dotClass: 'bg-yellow-400', textClass: 'text-yellow-600' },

  HORS_LIGNE:  { label: 'Hors ligne', dotClass: 'bg-slate-300',  textClass: 'text-slate-400' },
  NULL :       { label: '', dotClass: '',  textClass: '' }
};

@Component({
  selector: 'app-collaborateur-details-component',
  imports: [CommonModule, AvatarComponent],
  templateUrl: './collaborateur-details-component.html',
  styleUrl: './collaborateur-details-component.css',
})
export class CollaborateurDetailsComponent implements OnChanges {

  @Input() collaborateurId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() supprimer = new EventEmitter<number>();
  TacheRecentes : Tache[]=[];
  nbTachesTerminees: number=0;
  taches:Tache[]=[];
  projets :Projet[]=[];
  repartitionTache :Record<string,number>={
    'aFaire' :0,
    'enCours':0,
    'bloquee':0,
    'terminee':0
  }

   collaborateur : Utilisateur| null = null;

  constructor(private utilisateurService: UtilisateurService,
     private tacheService:TacheService, 
     private projetService : ProjetService,
    private notificationSocketService : NotificationSocketService) {}

  ngOnChanges() {
    this.collaborateur = null;
    if (this.collaborateurId) {
      this.utilisateurService.getUtilisateurById(this.collaborateurId).subscribe(
        (data) =>{
          this.collaborateur =Utilisateur.fromJson(data) 
              this.notificationSocketService.souscrireStatutUtilisateur(this.collaborateurId!);
              this.notificationSocketService.statutRecu.subscribe(update => {
             if (update.utilisateurId === this.collaborateurId) {
                this.collaborateur!.statutActivite = update.statut;}
              });
        this.tacheService.getTachesForMembre(this.collaborateurId!).subscribe(
          d =>{
            this.taches= d.map(json => Tache.fromJson(json))
          this.nbTachesTerminees= this.taches.filter(tache=> tache.statut === 'TERMINEE').length
          this.repartitionTache['aFaire']=this.taches.filter(tache=> tache.statut === 'A_FAIRE').length
          this.repartitionTache['enCours']=this.taches.filter(tache=> tache.statut === 'EN_COURS').length
          this.repartitionTache['terminee']=this.taches.filter(tache=> tache.statut === 'TERMINEE').length
          this.repartitionTache['bloquee']=this.taches.filter(tache=> tache.statut === 'BLOQUEE').length
          if (this.taches.length>5){
            this.TacheRecentes=this.taches.slice(0,5)
          }
          else {
            this.TacheRecentes=this.taches
          }
          

        }
        )
        this.projetService.getProjetByMembre(this.collaborateurId!).subscribe(
          d=> this.projets= d.map(json => Projet.fromJson(json))
        )


    });

    }
  }

  initiales(c: Utilisateur): string {
    return (c.prenom[0] + c.nom[0]).toUpperCase();
  }

  statutConfig(statut: StatutCollab) {
    if (statut)
    return STATUT_ACTIVITE_CONFIG[statut];
  else 
    return STATUT_ACTIVITE_CONFIG['NULL'];
  }

  progressionPct(c: Utilisateur): number {
    let nbTachesTerminees=this.taches.filter(tache=> tache.statut === 'TERMINEE').length
    let result: number = this.taches.length > 0  ? Math.round((nbTachesTerminees / this.taches.length) * 100)  :0;
    return result
  }

  tacheDotClass(statut: string): string {
    switch (statut) {
      case 'BLOQUEE': return 'bg-red-500';
      case 'TERMINEE': return 'bg-green-500';
      case 'EN_COURS': return 'bg-[#3A7CA5]';
      default: return 'bg-slate-300';
    }
  }

  prioriteClass(p: string): string {
    switch (p) {
      case 'HAUTE': return 'bg-orange-100 text-orange-700';
      case 'MOYENNE': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  prioriteLabel(p: string): string {
    return p === 'HAUTE' ? 'Haute' : p === 'MOYENNE' ? 'Moyenne' : 'Basse';
  }

  onSupprimer(c: Utilisateur) {
    this.supprimer.emit(c.id);
  }
  chercherProjet(tache:Tache){
    let projet :Projet[] = this.projets.filter(projet => projet.id === tache.projetId);
    return projet[0].nom;
    

  }
}