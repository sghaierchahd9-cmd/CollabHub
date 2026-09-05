import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Commentaire } from '../Model/Commentaire';
import { Utilisateur } from '../Model/Utilisateur';
import { CommentaireInputComponent } from '../commentaire-input-component/commentaire-input-component';
import { LoginService } from '../login-service';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur-service';

@Component({
  selector: 'app-commentaires-component',
  imports: [CommonModule, CommentaireInputComponent, FormsModule],
  templateUrl: './commentaires-component.html',
  styleUrl: './commentaires-component.css',
})
export class CommentairesComponent {
  @Input() commentaires: Commentaire[] = [];
  @Input() membresProjet: Utilisateur[] = [];
  @Input() chargementEnCours = false;

  @Output() ajouterCommentaire = new EventEmitter<{ contenu: string; parentId?: number; mentionIds: number[] }>();
 
  @Output() supprimerCommentaire = new EventEmitter<number>();
 @Output() modifierCommentaire = new EventEmitter<{ id: number; contenu: string; mentionIds: number[] }>();

  editionId: number | null = null;
  contenuEdition = '';
  repondreA: number | null = null;
  commentaireASupprimer: Commentaire | null = null;
  connectedUser: Utilisateur | null;

  constructor(private loginService: LoginService,private utilisateurService: UtilisateurService) {
    this.connectedUser = this.loginService.loggedIUser;
  }

  trackParId(index: number, commentaire: Commentaire): number {
    return commentaire.id;
  }

  toggleReponse(id: number): void {
    this.repondreA = this.repondreA === id ? null : id;
  }

  onNouveauCommentaire(event: { contenu: string; mentionIds: number[] }): void {
    this.ajouterCommentaire.emit(event);
  }

  onRepondre(parentId: number, event: { contenu: string; mentionIds: number[] }): void {
    this.ajouterCommentaire.emit({ ...event, parentId });
    this.repondreA = null;
  }

  peutModifier(commentaire: Commentaire): boolean {
    return this.connectedUser?.id === commentaire.user?.id
        || this.connectedUser?.role === 'ADMINISTRATEUR'
        || this.connectedUser?.role === 'CHEF_PROJET';
  }

  ouvrirEdition(commentaire: Commentaire): void {
    this.editionId = commentaire.id;
    this.contenuEdition = commentaire.contenu;
  }

  annulerEdition(): void {
    this.editionId = null;
    this.contenuEdition = '';
  }

 
  demanderSuppression(commentaire: Commentaire): void {
    this.commentaireASupprimer = commentaire;
  }

  confirmerSuppression(): void {
    if (!this.commentaireASupprimer) return;
    this.supprimerCommentaire.emit(this.commentaireASupprimer.id);
    this.commentaireASupprimer = null;
  }

  annulerSuppression(): void {
    this.commentaireASupprimer = null;
  }
  initialise(cmnt : Commentaire): string{
    if(cmnt.user)
      return cmnt.user.nom.charAt(0)+cmnt.user.prenom.charAt(0)
    else 
      return ''
  }
  
onModifierViaInput(commentaire: Commentaire, event: { contenu: string; mentionIds: number[] }): void {
  this.modifierCommentaire.emit({ id: commentaire.id, contenu: event.contenu, mentionIds: event.mentionIds });
  this.editionId = null;
}
}