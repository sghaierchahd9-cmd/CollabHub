import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Utilisateur } from '../Model/Utilisateur';
import { LoginService } from '../login-service';
import { UtilisateurService } from '../utilisateur-service';

@Component({
  selector: 'app-commentaire-input-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './commentaire-input-component.html',
  styleUrl: './commentaire-input-component.css',
})
export class CommentaireInputComponent implements OnInit {
  @Input() membresProjet: Utilisateur[] = [];
  @Input() placeholder = 'Écrire un commentaire...';
  @Output() envoyer = new EventEmitter<{ contenu: string; mentionIds: number[] }>();
  @Input() texteInitial: string = '';

  @Input() mentionIdsInitiaux: number[] = [];


  texte = '';
  suggestionsVisibles = false;
  suggestionsFiltrees: Utilisateur[] = [];
  mentionsSelectionnees = new Map<number, Utilisateur>();
  optionTousVisible = false;
  mentionnerTous = false;
  connectedUser: Utilisateur | null = null;

  constructor(private utilisateurService: UtilisateurService, private loginService: LoginService) {
  }
  ngOnInit(): void {
    this.texte = this.texteInitial;
    this.connectedUser = this.loginService.loggedIUser;
    if (this.mentionIdsInitiaux.length) {
      console.log("mentionIdsInitiaux : ", this.mentionIdsInitiaux)
      this.membresProjet
        .filter(m => this.mentionIdsInitiaux.includes(m.id))
        .forEach(m => this.mentionsSelectionnees.set(m.id, m));
    }


  }
  private chargerMembresProjet(): void {

  }
  onSaisie(): void {

    const dernierArobase = this.texte.lastIndexOf('@');
    if (dernierArobase === -1) {
      this.suggestionsVisibles = false;
      return;
    }

    const apresArobase = this.texte.substring(dernierArobase + 1);
    if (apresArobase.includes(' ')) {
      this.suggestionsVisibles = false;
      return;
    }
    if (this.connectedUser?.role === 'ADMINISTRATEUR' || this.connectedUser?.role === 'CHEF_PROJET') {
      this.utilisateurService.getUtilisateursByrole('ADMINISTRATEUR').subscribe({
        next: (data) => {
          const administrateurs = data.filter(admin => !this.membresProjet.some(m => m.id === admin.id)).map(admin => Utilisateur.fromJson(admin));
          this.membresProjet = [...this.membresProjet, ...administrateurs];
          const recherche = apresArobase.toLowerCase();
          this.suggestionsFiltrees = this.membresProjet.filter(m =>
            (m.nom + ' ' + m.prenom).toLowerCase().includes(recherche)
          );
         
          this.optionTousVisible = 'tous'.includes(recherche);
          this.suggestionsVisibles = this.suggestionsFiltrees.length > 0 || this.optionTousVisible;
         
        },
        error: (err) => {
          console.error('Erreur lors du chargement des administrateurs', err);
        }
      });


    }
    else {
      const recherche = apresArobase.toLowerCase();
      this.suggestionsFiltrees = this.membresProjet.filter(m =>
        (m.nom + ' ' + m.prenom).toLowerCase().includes(recherche)
      );
      console.log('Suggestions filtrées : ', this.suggestionsFiltrees);
      console.log('liste des membres du projet : ', this.membresProjet);
      this.optionTousVisible = 'tous'.includes(recherche);
      this.suggestionsVisibles = this.suggestionsFiltrees.length > 0 || this.optionTousVisible;
    }
  }

  selectionnerMention(membre: Utilisateur): void {
    const dernierArobase = this.texte.lastIndexOf('@');
    this.texte = this.texte.substring(0, dernierArobase) + `@${membre.nom}${membre.prenom} `;
    this.mentionsSelectionnees.set(membre.id, membre);
    this.mentionnerTous = false;
    this.suggestionsVisibles = false;
  }
  selectionnerTous(): void {
    const dernierArobase = this.texte.lastIndexOf('@');
    this.texte = this.texte.substring(0, dernierArobase) + `@tous `;
    this.mentionnerTous = true;
    this.mentionsSelectionnees.clear();
    this.suggestionsVisibles = false;
  }
  envoyerCommentaire(): void {
    if (!this.texte.trim()) return;
    const mentionIds = this.mentionnerTous
      ? this.membresProjet.map(m => m.id)   // ← calculé ICI, pas depuis mentionsSelectionnees
      : Array.from(this.mentionsSelectionnees.keys());
    this.envoyer.emit({
      contenu: this.texte.trim(),
      mentionIds: mentionIds
    });

    this.texte = '';
    this.mentionsSelectionnees.clear();
  }

}
