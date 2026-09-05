import { UtilisateurService } from './../utilisateur-service';
import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar-component/sidebar-component";
import { HeaderComponent } from "../header-component/header-component";
import { StatCartComponent } from "../stat-cart-component/stat-cart-component";
import { LoginService } from '../login-service';
import { Utilisateur } from '../Model/Utilisateur';
import { CommonModule } from '@angular/common';
import { AddCollaborateurForm } from "../add-collaborateur-form/add-collaborateur-form";
import { CollaborateurDetailsComponent } from "../collaborateur-details-component/collaborateur-details-component";
import { EquipeService } from '../equipe-service';
import { Equipe } from '../Model/Equipe';
import { AvatarComponent } from "../avatar-component/avatar-component";
@Component({
  selector: 'app-collaborateur-component',
  imports: [SidebarComponent, HeaderComponent, StatCartComponent, CommonModule, AddCollaborateurForm, CollaborateurDetailsComponent, AvatarComponent],
  templateUrl: './collaborateur-component.html',
  styleUrl: './collaborateur-component.css',
})
export class CollaborateurComponent {
  connectedUser: Utilisateur | null;
  utilisateurs: Utilisateur[] = [];
  selectedFiltre: string = "tous";
  Filtres = ['tous', 'Chef de projet', 'Collaborateur'];
  filtredresult: Utilisateur[] = [];
   equipes: Equipe[] = [];
  afficherFormAjout = false;
  enCoursCreation = false;
  erreurCreation: string | null = null;
  creationReussie = false;
  selectedMembreId: number | null = null;
  selectedMembre: Utilisateur | null = null;

  constructor(private loginsService: LoginService, private utilisateurService: UtilisateurService,private equipeService: EquipeService) {
    this.connectedUser = this.loginsService.loggedIUser;
  }

  statCartes = [
    { titre: "Total membres", valeur: 0, style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold" },
    { titre: "Chefs de projet", valeur: 0, style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold" },
    { titre: "Collaborateurs", valeur: 0, style: "font-['Plus_Jakarta_Sans'] text-[28px] font-bold" }
  ];

  FiltreMap: Record<string, string> = {
    "Chefs de projet": "CHEF_PROJET",
    "Collaborateurs": "COLLABORATEUR"
  };

  chargerCollaborateur() {
    this.utilisateurService.getUtilisateurs().subscribe(
      data => {
        this.utilisateurs = data.map(json => Utilisateur.fromJson(json));
        this.filtredresult = this.utilisateurs;
        this.statCartes[0].valeur = this.utilisateurs.length;
        for (let i = 1; i < this.statCartes.length; i++) {
          this.statCartes[i].valeur = this.utilisateurs.filter(person => person.role === this.FiltreMap[this.statCartes[i].titre]).length;
        }
      },
      error => { console.log("une erreur est survenue"); }
    );
  }

  ngOnInit() {
    this.chargerCollaborateur();
     this.chargerPoles(); 
    
  }

  selectFiltre(filtre: string) {
    this.selectedFiltre = filtre;
    this.filtrer();
  }

  filtrer(): void {
    if (this.selectedFiltre === 'tous') this.filtredresult = this.utilisateurs;
    else if (this.selectedFiltre === 'Chef de projet') this.filtredresult = this.utilisateurs.filter(person => person.role === 'CHEF_PROJET');
    else if (this.selectedFiltre === 'Collaborateur') this.filtredresult = this.utilisateurs.filter(person => person.role === 'COLLABORATEUR');
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'CHEF_PROJET': return 'Chef de projet';
      case 'COLLABORATEUR': return 'Collaborateur';
      case 'ADMINISTRATEUR': return 'Administrateur';
      default: return role;
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'CHEF_PROJET': return 'bg-[#dbeeff] text-[#2f6690]';
      case 'COLLABORATEUR': return 'bg-[#e8f5e9] text-[#2e7d32]';
      case 'ADMINISTRATEUR': return 'bg-[#ede9fe] text-[#6d28d9]';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  private avatarPalette = ['#3a7ca5', '#2f6690', '#16425b', '#81c3d7', '#5a9bc4', '#1e5878', '#2c6e9b', '#4f89b0'];

  getAvatarColor(id: number): string {
    if (!id) return this.avatarPalette[0];
    return this.avatarPalette[id % this.avatarPalette.length];
  }

  voir(membre: Utilisateur) {
    this.selectedMembreId = membre.id;
    this.selectedMembre = membre;
  }

  onSoumettreCollaborateur(data: any): void {
    this.enCoursCreation = true;
    this.erreurCreation = null;
    this.utilisateurService.creerUtilisateur(data).subscribe({
      next: () => {
        this.enCoursCreation = false;
        this.creationReussie = true;
      },
      error: (err) => {
        this.enCoursCreation = false;
        this.erreurCreation = err.error?.message ?? "Erreur lors de la création du compte.";
      }
    });
  }

  chargerPoles() {
    this.equipeService.getequipes().subscribe(data => {
      this.equipes = data.map(json => Equipe.fromJson(json));
    });
  }

  onFermerFormAjout(): void {
    const etaitReussi = this.creationReussie;
    this.afficherFormAjout = false;
    this.creationReussie = false;
    this.erreurCreation = null;
    if (etaitReussi) this.chargerCollaborateur();
  }

  onClickedButton(event: any) {
    this.afficherFormAjout = true;
  }

  contacter(membre: Utilisateur) {
    console.log("discuter à ", membre);
  }

  isDeleting = false;
  onConfirm() {
    this.isDeleting = true;
    this.utilisateurService.deleteMembre(this.selectedMembreId!).subscribe({
      next: () => {
        this.isDeleting = false;
        this.visible = false;
        this.selectedMembreId = null;
        this.chargerCollaborateur();
      },
      error: () => { this.isDeleting = false; }
    });
  }

  visible: boolean = false;
  onSupprimerCollaborateur(collabId: number) {
    this.visible = true;
  }
  onCancel() {
    this.visible = false;
  }
}
