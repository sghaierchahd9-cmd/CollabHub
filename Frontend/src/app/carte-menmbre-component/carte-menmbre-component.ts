import { StatutCollab } from './../Model/StatutCollab';
import { Component, OnChanges, OnInit, Input, SimpleChanges,Output } from '@angular/core';
import { Utilisateur } from '../Model/Utilisateur';
import { Tache } from '../Model/tache';
import { EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-carte-menmbre-component',
  templateUrl: './carte-menmbre-component.html',
  styleUrls: ['./carte-menmbre-component.css'],
  imports: [CommonModule, AvatarComponent]
})
export class CarteMenmbreComponent implements OnInit,OnChanges {
  @Input() membre :Utilisateur =new Utilisateur;
  @Input() taches :Tache[]=[];
   nbTacheTerminee :Number =this.taches.length;
   @Output() desaffecter = new EventEmitter<number>();
     @Output() voirDetails = new EventEmitter<Utilisateur>();
     @Input() currentUserRole: string = 'COLLABORATEUR'; 

  nbTaches=0;
  constructor(private notificationSocketService:NotificationSocketService ){}
  ngOnInit(): void {
      this.nbTacheTerminee=this.taches.filter(tache=> tache.statut==="TERMINEE").length;
      this.nbTaches=this.taches.length;
       this.notificationSocketService.souscrireStatutUtilisateur(this.membre.id!);
              this.notificationSocketService.statutRecu.subscribe(update => {
             if (update.utilisateurId === this.membre.id) {
                this.membre!.statutActivite = update.statut;}
              });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taches']) {
      this.nbTacheTerminee=this.taches.filter(tache=> tache.statut==="TERMINEE").length;
      this.nbTaches=this.taches.length;
  }
    }
    menuOuvert = false;
  confirmationOuverte = false;

  toggleMenu() {
    this.menuOuvert = !this.menuOuvert;
  }
  get peutVoirDetails(): boolean {
    return this.currentUserRole !== 'COLLABORATEUR';
  }

  demanderConfirmation() {
    this.menuOuvert = false;
    this.confirmationOuverte = true;
  }

  annuler() {
    this.confirmationOuverte = false;
  }

    onVoirDetails(): void {
    this.menuOuvert = false;
    this.voirDetails.emit(this.membre);
  }

  confirmerDesaffectation() {
    this.confirmationOuverte = false;
    this.desaffecter.emit(this.membre.id);
  }
  statutConfig(statut: StatutCollab) {
      if (statut)
      return STATUT_ACTIVITE_CONFIG[statut];
    else 
      return STATUT_ACTIVITE_CONFIG['NULL'];
    }
  }


