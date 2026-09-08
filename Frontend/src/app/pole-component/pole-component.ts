import { PoleFormModalComponent } from './../pole-form-modal-component/pole-form-modal-component';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar-component/sidebar-component';
import { HeaderComponent } from '../header-component/header-component';
import { LoginService } from '../login-service';
import { UtilisateurService } from '../utilisateur-service';
import { EquipeService } from '../equipe-service';
import { Utilisateur } from '../Model/Utilisateur';
import { Equipe } from '../Model/Equipe';
import { AjouterMembrePoleModalComponent } from '../ajouter-membre-pole-modal-component/ajouter-membre-pole-modal-component';
import { AvatarComponent } from "../avatar-component/avatar-component";


@Component({
  selector: 'app-pole-component',
  imports: [CommonModule, HeaderComponent, PoleFormModalComponent, AjouterMembrePoleModalComponent, AvatarComponent],
  templateUrl: './pole-component.html',
  styleUrl: './pole-component.css',
})


export class PoleComponent {
  connectedUser: Utilisateur | null;
  equipes: Equipe[] = [];
  tousLesUtilisateurs: Utilisateur[] = [];

  // état du modal formulaire (création / modification)
  afficherFormPole = false;
  poleEnEdition: Equipe | null = null; // null = mode création
  enCoursSoumission = false;
  erreurSoumission: string | null = null;

  // état du modal d'ajout de membre
  afficherAjoutMembre = false;
  poleCibleAjout: Equipe | null = null;
  enCoursAjoutMembre = false;
  erreurAjoutMembre: string | null = null;

  // confirmation de suppression (pôle ou membre)
  suppressionPoleVisible = false;
  poleASupprimer: Equipe | null = null;
  suppressionMembreVisible = false;
  membreASupprimer: { equipe: Equipe; membre: Utilisateur } | null = null;
  enCoursSuppression = false;

  constructor(
    private loginService: LoginService,
    private utilisateurService: UtilisateurService,
    private equipeService: EquipeService
  ) {
    this.connectedUser = this.loginService.loggedIUser;
  }

  ngOnInit(): void {
    this.chargerPoles();
    if (this.connectedUser?.role === 'ADMINISTRATEUR') {
      this.utilisateurService.getUtilisateurs().subscribe(data => {
        this.tousLesUtilisateurs = data.map(json => Utilisateur.fromJson(json));
      });
    }
  }

  chargerPoles(): void {
    this.utilisateurService.getEquipe(this.connectedUser?.id).subscribe(data => {
      this.equipes = data.map(json => Equipe.fromJson(json));
      this.equipes.forEach(equipe => {
        this.utilisateurService.getmembersEquipe(equipe.id).subscribe(members => {
          equipe.members = members.map(person => Utilisateur.fromJson(person));
        });
      });
    });
  }

  get estAdmin(): boolean {
    return this.connectedUser?.role === 'ADMINISTRATEUR';
  }

  // ---- membres éligibles pour un pôle donné ----
  membresEligibles(equipe: Equipe): Utilisateur[] {
    const idsActuels = new Set(equipe.members.map(m => m.id));
    return this.tousLesUtilisateurs.filter(u => !idsActuels.has(u.id) && u.role !== "ADMINISTRATEUR");
  }

  // ---- création / modification ----
  ouvrirCreation(): void {
    this.poleEnEdition = null;
    this.erreurSoumission = null;
    this.afficherFormPole = true;
  }

  ouvrirEdition(equipe: Equipe): void {
    this.poleEnEdition = equipe;
    this.erreurSoumission = null;
    this.afficherFormPole = true;
  }

  onSoumettrePole(data: { nom: string; description: string }): void {
    this.enCoursSoumission = true;
    this.erreurSoumission = null;

    const obs = this.poleEnEdition
      ? this.equipeService.updateEquipe(this.poleEnEdition.id, data)
      : this.equipeService.creerEquipe(data);

    obs.subscribe({
      next: () => {
        this.enCoursSoumission = false;
        this.afficherFormPole = false;
        this.chargerPoles();
      },
      error: (err) => {
        this.enCoursSoumission = false;
        this.erreurSoumission = err.error?.message ?? "Erreur lors de l'enregistrement du pôle.";
      },
    });
  }

  onFermerFormPole(): void {
    this.afficherFormPole = false;
    this.poleEnEdition = null;
    this.erreurSoumission = null;
  }

  // ---- suppression pôle ----
  demanderSuppressionPole(equipe: Equipe): void {
    this.poleASupprimer = equipe;
    this.suppressionPoleVisible = true;
  }

  confirmerSuppressionPole(): void {
    if (!this.poleASupprimer) return;
    this.enCoursSuppression = true;
    this.equipeService.deleteEquipe(this.poleASupprimer.id).subscribe({
      next: () => {
        this.enCoursSuppression = false;
        this.suppressionPoleVisible = false;
        this.poleASupprimer = null;
        this.chargerPoles();
      },
      error: () => { this.enCoursSuppression = false; },
    });
  }

  annulerSuppressionPole(): void {
    this.suppressionPoleVisible = false;
    this.poleASupprimer = null;
  }

  // ---- ajout de membre ----
  ouvrirAjoutMembre(equipe: Equipe): void {
    this.poleCibleAjout = equipe;
    this.erreurAjoutMembre = null;
    this.afficherAjoutMembre = true;
  }

  onSoumettreAjoutMembre(userId: number): void {
    if (!this.poleCibleAjout) return;
    this.enCoursAjoutMembre = true;
    this.erreurAjoutMembre = null;

    this.equipeService.ajouterMembre(this.poleCibleAjout.id, userId).subscribe({
      next: () => {
        this.enCoursAjoutMembre = false;
        this.afficherAjoutMembre = false;
        this.chargerPoles();
      },
      error: (err) => {
        this.enCoursAjoutMembre = false;
        this.erreurAjoutMembre = err.error?.message ?? err.error ?? "Erreur lors de l'affectation.";
      },
    });
  }

  onFermerAjoutMembre(): void {
    this.afficherAjoutMembre = false;
    this.poleCibleAjout = null;
    this.erreurAjoutMembre = null;
  }

  // ---- retrait de membre ----
  demanderRetraitMembre(equipe: Equipe, membre: Utilisateur): void {
    this.membreASupprimer = { equipe, membre };
    this.suppressionMembreVisible = true;
  }

  confirmerRetraitMembre(): void {
    if (!this.membreASupprimer) return;
    this.enCoursSuppression = true;
    const { equipe, membre } = this.membreASupprimer;
    this.equipeService.retirerMembre(equipe.id, membre.id).subscribe({
      next: () => {
        this.enCoursSuppression = false;
        this.suppressionMembreVisible = false;
        this.membreASupprimer = null;
        this.chargerPoles();
      },
      error: () => { this.enCoursSuppression = false; },
    });
  }

  annulerRetraitMembre(): void {
    this.suppressionMembreVisible = false;
    this.membreASupprimer = null;
  }

  getAvatarColor(id: number): string {
    const palette = ['#3a7ca5', '#2f6690', '#16425b', '#81c3d7', '#5a9bc4', '#1e5878'];
    return palette[id % palette.length];
  }
}