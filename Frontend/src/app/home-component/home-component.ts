
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar-component/sidebar-component";
import { LoginService } from '../login-service';
import { Utilisateur } from '../Model/Utilisateur';
import { Projet } from '../Model/Projet';
import { Tache } from '../Model/tache';
import {HeaderComponent} from "../header-component/header-component";
import {TachesComponent} from '../taches-component/taches-component';
import { TacheService } from '../tache-service';
import { ProjetService } from '../projet-service';
import { UtilisateurService } from '../utilisateur-service';
import { EquipeService } from '../equipe-service';
import { Equipe } from '../Model/Equipe';
import { StatCartComponent } from '../stat-cart-component/stat-cart-component';
import { CommonModule } from '@angular/common';
import { RepartitionTacheChartComponent } from "../repartition-tache-chart-component/repartition-tache-chart-component";
import { ActivityNotificationService } from '../activity-notification-service';
import {MonthlyStats} from '../Model/Monthlystats';
import { MonthlyStatsComponent } from "../monthly-stats-component/monthly-stats-component";
import { EquipesListComponent } from "../equipes-list-component/equipes-list-component";

@Component({
  selector: 'app-home-component',
  imports: [SidebarComponent, HeaderComponent, StatCartComponent, CommonModule, RepartitionTacheChartComponent, MonthlyStatsComponent, EquipesListComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent implements OnInit {
   projets : Projet[] = [];
   taches : Tache[] = [];
   members : Utilisateur[] = [];
   tachesCount : number[] = [];
   equipes : Equipe[]=[];
   labelsChart :string[]=['En cours','Planifié','Terminé','Suspendu','Archivé'];
   dataChart :number[]=[];
   stasts :MonthlyStats[]=[];
   mapStatut: Record<string,string> = {'En cours': "EN_COURS",
      'Planifié': "PLANIFIER",
      'Terminé' : "TERMINE",
      'Suspendu':'SUSPENDU',
      'Archivé': 'ARCHIVE'

   }
   colorsChart :string[]=[ '#2563EB', '#f1c946', '#22C55E','#EF4444','#c8cfd8']
   cartes=[{
      "titre":"Membres actifs",
      "valeur":0,
      "style":"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"
   },
   {"titre":"Total Projets",
      "valeur":0,
      "style":"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"
   },
   {"titre":"Total Taches",
      "valeur":0,
      "style":"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"
   },
   {"titre":"Taches Terminées",
      "valeur":0,
      "style":"font-['Plus_Jakarta_Sans'] text-[28px] font-bold"
   }

]
   private loggedInUser: Utilisateur | null = null;
  constructor(private loginService: LoginService,private tacheService :TacheService,private projetService:ProjetService, private UtilisateurService :UtilisateurService, private equipeService :EquipeService, private notifService: ActivityNotificationService ) {
     this.loggedInUser  = this.loginService.loggedIUser;
  }
  ngOnInit() {
   console.log('Logged in user:', this.loggedInUser);
   console.log('tachesCount:', this.tachesCount);
   console.log('taches:', this.taches);
  this.UtilisateurService.getUtilisateurs().subscribe(
   (data)=>{
      this.members= data.map(json=> Utilisateur.fromJson(json))
      this.cartes[0].valeur=this.members.length;
   }
  )
  this.projetService.getProjet().subscribe(
   (data)=>{
      this.projets=data.map(json => Projet.fromJson(json));
      this.cartes[1].valeur= this.projets.length
      for(let i=0; i<this.labelsChart.length;i++){
         this.dataChart[i]=this.projets.filter(projet => projet.statut === this.mapStatut[this.labelsChart[i]]).length;
        console.log(this.labelsChart[i] , this.dataChart[i])
      }
      
      this.notifService.notifierActivite()
   })
   this.tacheService.getTaches().subscribe(
      (data)=>{
         this.taches= data.map(json => Tache.fromJson(json));
         this.cartes[2].valeur= this.taches.length
         this.cartes[3].valeur= this.taches.filter(tache => tache.statut === 'TERMINEE').length;
         this.stasts=this.calculateMonthlyStats(this.taches);
      }
   )
   this.equipeService.getequipes().subscribe(
      (data)=> {
         this.equipes= data.map(json => Equipe.fromJson(json));
         this.equipes.forEach(element => { this.UtilisateurService.getmembersEquipe(element.id).subscribe(
      members => {element.members= members.map(person => Utilisateur.fromJson(person))});
    });
         console.log("equipes home ", this.equipes);
      }
   )

  
}

calculateMonthlyStats(taches: Tache[]): MonthlyStats[] {
  const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  // Init des 12 mois à 0
  const stats: MonthlyStats[] = moisLabels.map(m => ({ month: m, created: 0, completed: 0 }));

  const currentYear = new Date().getFullYear();

  taches.forEach(t => {
    
    const dateCreation = new Date(t.dateCreation);
    if (dateCreation.getFullYear() === currentYear) {
      stats[dateCreation.getMonth()].created++;
    }

   
    if (t.statut === 'TERMINEE' && t.echeance) {
      const dateCompletion = new Date(t.echeance);
      if (dateCompletion.getFullYear() === currentYear) {
        stats[dateCompletion.getMonth()].completed++;
      }
    }
  });

  return stats;
}

}