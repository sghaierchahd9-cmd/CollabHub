
import { Component, OnInit } from '@angular/core';
import { Projet } from '../Model/Projet';
import { Input } from '@angular/core';
import { HeaderComponent } from '../header-component/header-component';
import { ProjetService } from '../projet-service';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar-component/sidebar-component';
import { LoginService } from '../login-service';
import { Utilisateur } from '../Model/Utilisateur';
import { Tache } from '../Model/tache';
import { UtilisateurService } from '../utilisateur-service';
import { NgClass, NgStyle } from '@angular/common';
import { TacheService } from '../tache-service';
import { CommonModule } from '@angular/common';
import { StatCartComponent } from "../stat-cart-component/stat-cart-component";
import { AddCollaborateurForm } from "../add-collaborateur-form/add-collaborateur-form";
import { KanbanComponent } from '../kanban-component/kanban-component';
import { AddTacheComponent } from '../add-tache-component/add-tache-component';
import { CarteMenmbreComponent } from "../carte-menmbre-component/carte-menmbre-component";
import { formatDate } from '@angular/common';
import { RepartitionTacheChartComponent } from '../repartition-tache-chart-component/repartition-tache-chart-component';
import { ActivityLogComponent } from "../activity-log-component/activity-log-component";
import { AddMembreComponent } from '../add-membre-component/add-membre-component';
import { Equipe } from '../Model/Equipe';
import { EquipeService } from '../equipe-service';
import { ActivityNotificationService } from '../activity-notification-service';
import { ModifieTacheComponent } from "../modifie-tache-component/modifie-tache-component";
import { DetailMembreProjetComponent } from '../detail-membre-projet-component/detail-membre-projet-component';
import { ProjetPayload } from '../modifier-projet-component/modifier-projet-component';
import { ModifierProjetComponent } from '../modifier-projet-component/modifier-projet-component';
import { MettreAjourAvancementComponent } from "../mettre-ajour-avancement-component/mettre-ajour-avancement-component";
import { TacheDetailComponent } from "../tache-detail-component/tache-detail-component";
import { PiecesJointesModalComponent } from "../pieces-jointes-modal-component/pieces-jointes-modal-component";
import { Subscription } from 'rxjs';
import { NotificationSocketService } from '../notification-socket-service';
import { EspaceCollaboratifProjetComponent } from "../espace-collaboratif-projet-component/espace-collaboratif-projet-component";
import { TacheInfrmationComponent } from "../tache-infrmation-component/tache-infrmation-component";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-projet-detail-component',
  imports: [HeaderComponent, NgStyle, CommonModule, StatCartComponent, AddMembreComponent, KanbanComponent, AddTacheComponent, NgClass, CarteMenmbreComponent, RepartitionTacheChartComponent, ActivityLogComponent, ModifieTacheComponent, DetailMembreProjetComponent, ModifierProjetComponent, MettreAjourAvancementComponent, TacheDetailComponent, PiecesJointesModalComponent, EspaceCollaboratifProjetComponent, TacheInfrmationComponent],
  templateUrl: './projet-detail-component.html',
  styleUrl: './projet-detail-component.css',
})
export class ProjetDetailComponent implements OnInit {
  projet!: Projet;
  connectedUser: Utilisateur | null;
  ChefProjet: Utilisateur | null = null;
  collaborateurs: Utilisateur[] = [];
  equipes: Equipe[] = [];
  taches: Tache[] = [];
  afficherModalTache = false;
  afficherModalProjet = false;
  enregistrementProjetEnCours = false;
  erreurProjet: string | null = null;
  ajouterCollab = false;
  succesCreationTache = false;
  chartLabels = ['En cours', 'A faire', 'Terminée', 'Bloquée']
  chartLableColors = ['#2563EB', '#c8cfd8', '#22C55E', '#EF4444']
  chartData: number[] = [];
  subtitle = '';
  avancement: Number = 0;
  PrioriteDesign: Record<string, string> = {
    "HAUTE": "rounded-2xl px-3 py-1 text-xs font-semibold bg-[#AB3535] text-white",
    "MOYENNE": "rounded-2xl px-3 py-1 text-xs font-semibold bg-[#FFF3B0] text-black",
    "BASSE": "rounded-2xl px-3 py-1 text-xs font-semibold bg-[#8BBD82] text-white"

  }
  selectedFiltre = 'Taches';
  cartes = [
    {
      titre: 'Total taches',
      valeur: 0,
      style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold"
    },
    {
      titre: 'A faire',
      valeur: 0,
      style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#F59E0B]"
    },
    {
      titre: 'En cours',
      valeur: 0,
      style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#3B82F6] "
    },
    {
      titre: 'Terminée',
      valeur: 0,
      style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#10B981]"
    },
    {
      titre: 'Bloquée',
      valeur: 0,
      style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold text-[#EF4444]"
    }

  ]
  tacheStatuts: string[] = ['Total', 'A_FAIRE', 'EN_COURS', 'TERMINEE', 'BLOQUEE'];
  statusStyles: Record<string, string> = {
    'À faire': 'bg-slate-300',
    'En cours': 'bg-blue-500',
    'Terminé': 'bg-green-500'
  };
  mapBdVue: Record<string, string> = {
    'A faire': 'A_FAIRE',
    'En cours': 'EN_COURS',
    'Terminée': 'TERMINEE',
    'Bloquée': 'BLOQUEE'
  }
  tacheEnEdition: Tache | null = null;
  succesModificationTache = false;
  membreSelectionne: Utilisateur | null = null;
  afficherModalDetails = false;
  afficherModalAvancement = false;
  tacheSelectionnee: Tache | null = null;
  enregistrementAvancementEnCours = false;
  erreurAvancement: string | null = null;
  private subNotif?: Subscription;
  constructor(private projetService: ProjetService, private router: ActivatedRoute,
    private loginService: LoginService, private utilisateurService: UtilisateurService,
    private tacheService: TacheService,
    private equipeService: EquipeService,
    private notifService: ActivityNotificationService,
    private notificationSocketService: NotificationSocketService,
    private route: Router
  ) {
    this.connectedUser = this.loginService.loggedIUser

  }



  chargerTaches() {
    this.tacheService.getTacheByProjet(this.projet!.id).subscribe((data) => {
      this.taches = data.map(json => Tache.fromJson(json));

      const totalTaches = this.taches.length;
      const tachesTerminees = this.taches.filter(tache => tache.statut === 'TERMINEE').length;
      let SommeAvancement = 0;
      this.taches.forEach(tache => {
        SommeAvancement += Number(tache.tauxAvancement);
      });
      this.avancement = totalTaches > 0 ? Math.round((SommeAvancement / totalTaches) ) : 0;

      this.cartes[0].valeur = this.taches.length;
      for (let i = 1; i < this.tacheStatuts.length; i++) {
        this.cartes[i].valeur = this.CalculTacheParStatut(this.tacheStatuts[i]);
      }


      this.chartData = this.chartLabels.map(
        label => this.CalculTacheParStatut(this.mapBdVue[label])
      );
     
    },
      (error) => {
        console.log("une erreur est survenue !!");
      });
  }
  chargerEquipe() {
    this.utilisateurService.getCollaborateurs(this.projet?.id).subscribe(
      data => {
        this.collaborateurs = data.map(json => Utilisateur.fromJson(json));
      },
      (error) => {
        console.log("une erreur est servenue !!");
      }
    )
  }
  chargerChef() {
    this.chargerEquipe();
    this.utilisateurService.getUtilisateurById(this.projet?.chefProjet).subscribe(
      data => {
        this.ChefProjet = Utilisateur.fromJson(data);
        const dateFormatee = formatDate(this.projet.dateFinPrevue, 'dd/MM/yyyy', 'fr-FR');
        this.subtitle = "Chef de projet: " + this.ChefProjet.nom + " " + this.ChefProjet.prenom
          + " . Échéance " + dateFormatee;
      },
      (error) => {
        console.log("une erreur est servenue !!");
      }
    )
  }
  ngOnInit(): void {

    this.router.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      this.projetService.getProjetById(id).subscribe({ next: projet => {
        this.projet = projet;
        this.chargerEquipe();
        this.chargerChef();
        this.chargerTaches();        
        const typesRafraichissants = ['AFFECTATION_TACHE', 'DESAFFECTATION_TACHE']; // à adapter au nom exact

        this.subNotif = this.notificationSocketService.notificationRecue.subscribe(notif => {
          if (typesRafraichissants.includes(notif.typeEvenement)) {
            this.chargerTaches();
          }
        });

        this.equipeService.getequipes().subscribe({
          next: data => {
            this.equipes = data.map(json => Equipe.fromJson(json));
            this.equipes.forEach(equipe => {
              this.utilisateurService.getmembersEquipe(equipe.id).subscribe({
                next: data => equipe.members = data.map(json => Utilisateur.fromJson(json)),
                error: () => console.log('une erreur est survenue'),
              });
            });
          },
        });

      
      },
      error:(err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.route.navigate(['/acces-refuse']);}
          else if (err.status === 404) {
            this.route.navigate(['/not-found']);
          }
      
        }
      }
    );
    });
    this.collaborateurs.forEach(m => this.notificationSocketService.souscrireStatutUtilisateur(m.id));

this.notificationSocketService.statutRecu.subscribe(update => {
  const membre = this.collaborateurs.find(m => m.id === update.utilisateurId);
  if (membre) {
    membre.statutActivite = update.statut;
  }
});


  }
  public CalculTacheParStatut(statut: string): number {
    return (this.taches.filter(tache => tache.statut === statut)).length;

  }
  statChange() {
    this.chargerTaches();
    this.notifService.notifierActivite();
  }
  // creation d'une tache 
  creerTache(requete: Tache): void {
    this.tacheService.creerTache(requete).subscribe({
      next: (json) => {
        const tache = Tache.fromJson(json);
        this.taches = [...this.taches, tache];
        this.chargerTaches();
        this.succesCreationTache = true;
        this.notifService.notifierActivite();
      }
    });
  }
  filtrerTaches(membre: Utilisateur): Tache[] {
    return this.taches.filter(tache =>
      tache.collaborateurs.some(person => person.id === membre.id)
    );
  }
  modalAjoutMembreOuvert = false;

  // Ajouter Membre
  ouvrirModalAjoutMembre() {
    this.modalAjoutMembreOuvert = true;
  }


  onAjouterMembres(membreIds: number[]) {
    let projetModifie = this.projet;
    if (membreIds) {
      projetModifie.collaborateurIds.push(...membreIds);
      this.projetService.modifierProjet(projetModifie).subscribe(() => {
        this.chargerEquipe();
        this.notifService.notifierActivite();
     
      });
    }

    this.modalAjoutMembreOuvert = false;
  }
  //Desaffecter membre 

  onDesaffecterMembre(membreId: number) {
    const nouveauxIds = this.collaborateurs
      .map(c => c.id)
      .filter(id => id !== membreId);
    let projetModifie = this.projet;
    projetModifie.collaborateurIds = nouveauxIds
    this.projetService.modifierProjet(projetModifie).subscribe({
      next: (json) => {
        this.projet = Projet.fromJson(json);
        this.chargerEquipe();
        this.notifService.notifierActivite();
      },
      error: () => console.log("erreur lors de la désaffectation")
    });
  }

  // Modifier une Tache

  onModifierTache(tache: Tache) {
    this.tacheEnEdition = tache;
    this.succesModificationTache = false;
  }

  onTacheModifiee(event: { id: number; requete: any }) {
    this.tacheService.modifierTache(event.id, event.requete).subscribe({
      next: (json) => {
        const tacheMaj = Tache.fromJson(json);
        this.taches = this.taches.map(t => t.id === tacheMaj.id ? tacheMaj : t);
        this.notifService.notifierActivite();
        this.succesModificationTache = true; // affiche l'écran de confirmation
      },
      error: () => console.log("erreur lors de la modification")
    });
  }

  onFermerEdition() {
    this.tacheEnEdition = null;
    this.succesModificationTache = false;
  }

  //detail d'un membre 

  onVoirDetailsMembre(membre: Utilisateur): void {
    this.membreSelectionne = membre;
    this.afficherModalDetails = true;
  }

  fermerModalDetails(): void {
    this.afficherModalDetails = false;
    this.membreSelectionne = null;
  }
  // Modification d'un projet
  onFermerModalProjet(): void {
    this.afficherModalProjet = false;
    this.erreurProjet = null;
  }

  onEnregistrerProjet(payload: ProjetPayload): void {
    if (!this.projet) return;

    this.enregistrementProjetEnCours = true;
    this.erreurProjet = null;
    let projetModifier = {
      ...payload,
      id: this.projet.id,
      dateCreation: this.projet.dateCreation,
      estArchive: this.projet.estArchive
    }
    this.projetService.modifierProjet(projetModifier).subscribe({
      next: (json) => {
        this.projet = Projet.fromJson(json);
        this.chargerEquipe();
        this.chargerChef();
        this.notifService.notifierActivite();
        this.enregistrementProjetEnCours = false;
        this.afficherModalProjet = false;
      },
      error: (err) => {
        console.error('Erreur lors de la modification du projet', err);
        this.enregistrementProjetEnCours = false;
        this.erreurProjet = 'Impossible de modifier le projet. Réessaie dans quelques instants.';
      }
    });
  }
  onOuvrirModalAvancement(tache: Tache): void {
    this.tacheSelectionnee = tache;
    this.erreurAvancement = null;
    this.afficherModalAvancement = true;
  }

  onFermerModalAvancement(): void {
    this.afficherModalAvancement = false;
    this.tacheSelectionnee = null;
    this.erreurAvancement = null;
  }

  onEnregistrerAvancement(tauxAvancement: number): void {
    if (!this.tacheSelectionnee) return;

    const tacheId = this.tacheSelectionnee.id;
    this.enregistrementAvancementEnCours = true;
    this.erreurAvancement = null;

    this.tacheService.mettreAJourAvancement(tacheId, tauxAvancement).subscribe({
      next: (json) => {
        const tacheMiseAJour = Tache.fromJson(json);


        this.taches = this.taches.map(t => t.id === tacheId ? tacheMiseAJour : t);

        this.enregistrementAvancementEnCours = false;
        this.afficherModalAvancement = false;
        this.tacheSelectionnee = null;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de l\'avancement', err);
        this.enregistrementAvancementEnCours = false;
        this.erreurAvancement = err.status === 403
          ? 'Tu n\'es pas autorisé à modifier l\'avancement de cette tâche.'
          : 'Impossible d\'enregistrer l\'avancement. Réessaie dans quelques instants.';

      }
    });
  }
  ouvreDetailTache = false;
  onOuvreDetailTache(tache: Tache) {
    this.ouvreDetailTache = true;
    this.tacheSelectionnee = tache;
  }
  afficherModalPiecesJointes = false;

  onOuvrirPiecesJointes(tache: Tache): void {
    this.tacheSelectionnee = tache;
    this.afficherModalPiecesJointes = true;
  }
  afficheInfoTache=false;
  selectTache(tache :Tache){
    this.tacheSelectionnee=tache;
    this.afficheInfoTache=true;
    
  }
}
