import { Component, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Commentaire } from '../Model/Commentaire';
import { Utilisateur } from '../Model/Utilisateur';
import { CommentaireService } from '../commentaire-service';
import { CommentairesComponent } from '../commentaires-component/commentaires-component';
import { insererCommentaire, mettreAJourCommentaire, retirerCommentaire, trouverCommentaire ,upsertCommentaire} from '../commentaires-arborescence.utils';
import { Subscription } from 'rxjs';
import { NotificationSocketService } from '../notification-socket-service';
import { UtilisateurService } from '../utilisateur-service';
import { LoginService } from '../login-service';

@Component({
  selector: 'app-espace-collaboratif-projet-component',
  imports: [CommentairesComponent, CommonModule],
  templateUrl: './espace-collaboratif-projet-component.html',
  styleUrl: './espace-collaboratif-projet-component.css',
})
export class EspaceCollaboratifProjetComponent implements OnInit, OnDestroy {
   @Input({ required: true }) projetId!: number;
  @Input() membresProjet: Utilisateur[] = [];

  commentaires: Commentaire[] = [];
  chargementCommentaires = false;

  private subCommentaireLive?: Subscription;
  private subReconnexion?: Subscription;

  constructor(
    private commentaireService: CommentaireService,
    private notificationSocketService: NotificationSocketService,
    private utilisateurService: UtilisateurService,
    private loginService: LoginService
  ) {
    this.subCommentaireLive = this.notificationSocketService.commentaireProjetRecue.subscribe(({ projetId, commentaire }) => {
      if (projetId !== this.projetId) return;
      this.appliquerEvenement(commentaire);
    });

    this.subReconnexion = this.notificationSocketService.reconnexion.subscribe(() => {
      this.chargerCommentaires();
    });
  }

  ngOnInit(): void {
    this.chargerCommentaires();
    this.notificationSocketService.souscrireCommentairesProjet(this.projetId);
  
    
  }

  private appliquerEvenement(commentaire: Commentaire): void {
    if (commentaire.dateSuppression) {
      this.commentaires = retirerCommentaire(this.commentaires, commentaire.id);
      return;
    }

    this.commentaires = upsertCommentaire(this.commentaires, commentaire);
  }

  private chargerCommentaires(): void {
    this.chargementCommentaires = true;
    this.commentaireService.getCommentairesProjet(this.projetId).subscribe({
      next: (data) => {
        this.commentaires = data.map(json => Commentaire.fromJson(json));
        this.chargementCommentaires = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires', err);
        this.chargementCommentaires = false;
      }
    });
  }

  onAjouterCommentaire(payload: { contenu: string; parentId?: number; mentionIds: number[] }): void {
  this.commentaireService.ajouterCommentaireProjet(this.projetId, payload).subscribe({
    next: (nouveau) => this.commentaires = upsertCommentaire(this.commentaires, Commentaire.fromJson(nouveau)),
    error: (err) => console.error('Erreur ajout commentaire', err)
  });
}

  onModifierCommentaire(event: { id: number; contenu: string; mentionIds: number[] }): void {
  this.commentaireService.modifierCommentaire(event.id, event.contenu, event.mentionIds).subscribe({
    next: (maj) => this.commentaires = mettreAJourCommentaire(this.commentaires, Commentaire.fromJson(maj)),
    error: (err) => console.error('Erreur modification commentaire', err)
  });
}

  onSupprimerCommentaire(id: number): void {
    this.commentaireService.supprimerCommentaire(id).subscribe({
      next: () => this.commentaires = retirerCommentaire(this.commentaires, id),
      error: (err) => console.error('Erreur suppression commentaire', err)
    });
  }

  ngOnDestroy(): void {
    this.subCommentaireLive?.unsubscribe();
    this.subReconnexion?.unsubscribe();
    this.notificationSocketService.desouscrireCommentairesProjet(this.projetId);
  }
}

