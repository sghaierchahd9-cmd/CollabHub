
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tache } from '../Model/tache';
import { Commentaire } from '../Model/Commentaire';
import { Utilisateur } from '../Model/Utilisateur';
import { CommentaireService } from '../commentaire-service';
import { CommentairesComponent } from '../commentaires-component/commentaires-component';
import { insererCommentaire, mettreAJourCommentaire, retirerCommentaire, trouverCommentaire,upsertCommentaire } from './../commentaires-arborescence.utils';
import { Subscription
 } from 'rxjs';
 import { NotificationSocketService } from '../notification-socket-service';


@Component({
  selector: 'app-tache-detail-component',
  imports: [CommentairesComponent,CommonModule],
  templateUrl: './tache-detail-component.html',
  styleUrl: './tache-detail-component.css',
})
export class TacheDetailComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() tache: Tache | null = null;
  @Input() membresProjet: Utilisateur[] = [];
  @Output() fermer = new EventEmitter<void>();

  commentaires: Commentaire[] = [];
  chargementCommentaires = false;

  private subCommentaireLive?: Subscription;
  private subReconnexion?: Subscription;
  private tacheAbonneeId: number | null = null;

  constructor(
    private commentaireService: CommentaireService,
    private notificationSocketService: NotificationSocketService
  ) {
    // Abonnement permanent au flux de commentaires — filtré par tâche à chaque événement
    this.subCommentaireLive = this.notificationSocketService.commentaireRecue.subscribe(({ tacheId, commentaire }) => {
      if (!this.tache || tacheId !== this.tache.id) return;
      this.appliquerEvenement(commentaire);
    });

    // Si la connexion WebSocket a été coupée puis rétablie, on ne peut plus garantir
    // qu'aucun événement n'a été manqué pendant la coupure → resynchronisation complète.
    this.subReconnexion = this.notificationSocketService.reconnexion.subscribe(() => {
      if (this.isOpen && this.tache) {
        this.chargerCommentaires();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['tache']) {
      if (this.isOpen && this.tache) {
        this.chargerCommentaires();
        this.gererAbonnement(this.tache.id);
      } else if (!this.isOpen && this.tacheAbonneeId !== null) {
        this.notificationSocketService.desouscrireCommentairesTache(this.tacheAbonneeId);
        this.tacheAbonneeId = null;
      }
    }
  }

  
private appliquerEvenement(commentaire: Commentaire): void {
  if (commentaire.dateSuppression) {
    this.commentaires = retirerCommentaire(this.commentaires, commentaire.id);
    return;
  }
  this.commentaires = upsertCommentaire(this.commentaires, commentaire);
}



  private gererAbonnement(nouvelleTacheId: number): void {
    if (this.tacheAbonneeId === nouvelleTacheId) return;
    if (this.tacheAbonneeId !== null) {
      this.notificationSocketService.desouscrireCommentairesTache(this.tacheAbonneeId);
    }
    this.notificationSocketService.souscrireCommentairesTache(nouvelleTacheId);
    this.tacheAbonneeId = nouvelleTacheId;
  }

  private chargerCommentaires(): void {
    if (!this.tache) return;
    this.chargementCommentaires = true;
    this.commentaireService.getCommentairesTache(this.tache.id).subscribe({
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

 

// Exemple attendu — TacheDetailComponent (smart)
onAjouterCommentaire(payload: { contenu: string; parentId?: number; mentionIds: number[] }): void {
  this.commentaireService.ajouterCommentaireTache(this.tache!.id, payload).subscribe({
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

  fermerModal(): void {
    if (this.tacheAbonneeId !== null) {
      this.notificationSocketService.desouscrireCommentairesTache(this.tacheAbonneeId);
      this.tacheAbonneeId = null;
    }
    this.fermer.emit();
  }

  ngOnDestroy(): void {
    this.subCommentaireLive?.unsubscribe();
    this.subReconnexion?.unsubscribe();
    if (this.tacheAbonneeId !== null) {
      this.notificationSocketService.desouscrireCommentairesTache(this.tacheAbonneeId);
    }
  }}
