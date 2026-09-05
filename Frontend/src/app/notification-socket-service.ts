import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { Notification } from './Model/Notification';
import { Commentaire } from './Model/Commentaire';
import { StatutUpdate } from './Model/StatutUpdate';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private client: Client | null = null;
  private notificationRecue$ = new Subject<Notification>();
  public notificationRecue = this.notificationRecue$.asObservable();

  private commentaireSubs = new Map<number, StompSubscription>();
  private commentaireRecue$ = new Subject<{ tacheId: number; commentaire: Commentaire }>();
  public commentaireRecue = this.commentaireRecue$.asObservable();

  // --- Commentaires projet : nouveau, même pattern, map/subject dédiés ---
  private commentaireProjetSubs = new Map<number, StompSubscription>();
  private commentaireProjetRecue$ = new Subject<{ projetId: number; commentaire: Commentaire }>();
  public commentaireProjetRecue = this.commentaireProjetRecue$.asObservable();

  private statutSubs = new Map<number, StompSubscription>();
  private statutRecu$ = new Subject<StatutUpdate>();
  public statutRecu = this.statutRecu$.asObservable();

  private reconnexion$ = new Subject<void>();
  public reconnexion = this.reconnexion$.asObservable();
  private dejaConnecteUneFois = false;

  connecter(token: string): void {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe('/user/queue/notifications', (message: IMessage) => {
          const notif = Notification.fromJson(JSON.parse(message.body));
          this.notificationRecue$.next(notif);
        });

        if (this.dejaConnecteUneFois) {
          const tachesAbonnees = [...this.commentaireSubs.keys()];
          this.commentaireSubs.clear();
          tachesAbonnees.forEach(id => this.souscrireCommentairesTache(id));

          // Réabonnement des commentaires de projet après reconnexion — même logique
          const projetsAbonnes = [...this.commentaireProjetSubs.keys()];
          this.commentaireProjetSubs.clear();
          projetsAbonnes.forEach(id => this.souscrireCommentairesProjet(id));

          const utilisateursAbonnes = [...this.statutSubs.keys()];
          this.statutSubs.clear();
          utilisateursAbonnes.forEach(id => this.souscrireStatutUtilisateur(id));

          this.reconnexion$.next();
        }
        this.dejaConnecteUneFois = true;
        console.log(' STOMP CONNECT réussi');
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP :', frame.headers['message']);
      }
    });

    this.client.activate();
  }

  souscrireCommentairesTache(tacheId: number): void {
    if (!this.client?.connected) return;
    if (this.commentaireSubs.has(tacheId)) return;

    const sub = this.client.subscribe(`/topic/taches/${tacheId}/commentaires`, (message: IMessage) => {
      const commentaire = Commentaire.fromJson(JSON.parse(message.body));
      this.commentaireRecue$.next({ tacheId, commentaire });
    });
    this.commentaireSubs.set(tacheId, sub);
  }

  desouscrireCommentairesTache(tacheId: number): void {
    this.commentaireSubs.get(tacheId)?.unsubscribe();
    this.commentaireSubs.delete(tacheId);
  }

  // --- Commentaires projet : nouvelles méthodes, même pattern ---
  souscrireCommentairesProjet(projetId: number): void {
    if (!this.client?.connected) {
      console.warn('WebSocket non connecté, abonnement commentaires projet ignoré');
      return;
    }
    if (this.commentaireProjetSubs.has(projetId)) return;

    const sub = this.client.subscribe(`/topic/projets/${projetId}/commentaires`, (message: IMessage) => {
      const commentaire = Commentaire.fromJson(JSON.parse(message.body));
      this.commentaireProjetRecue$.next({ projetId, commentaire });
    });
    this.commentaireProjetSubs.set(projetId, sub);
  }

  desouscrireCommentairesProjet(projetId: number): void {
    this.commentaireProjetSubs.get(projetId)?.unsubscribe();
    this.commentaireProjetSubs.delete(projetId);
  }

  souscrireStatutUtilisateur(utilisateurId: number): void {
    if (!this.client?.connected) {
      console.warn('WebSocket non connecté, abonnement statut ignoré');
      return;
    }
    if (this.statutSubs.has(utilisateurId)) return;

    const sub = this.client.subscribe(`/topic/utilisateurs/${utilisateurId}/statut`, (message: IMessage) => {
      const update: StatutUpdate = JSON.parse(message.body);
      this.statutRecu$.next(update);
    });
    this.statutSubs.set(utilisateurId, sub);
  }

  desouscrireStatutUtilisateur(utilisateurId: number): void {
    this.statutSubs.get(utilisateurId)?.unsubscribe();
    this.statutSubs.delete(utilisateurId);
  }

  deconnecter(): void {
    this.commentaireSubs.forEach(sub => sub.unsubscribe());
    this.commentaireSubs.clear();
    this.commentaireProjetSubs.forEach(sub => sub.unsubscribe()); // ← ajout
    this.commentaireProjetSubs.clear();                           // ← ajout
    this.statutSubs.forEach(sub => sub.unsubscribe());
    this.statutSubs.clear();
    this.dejaConnecteUneFois = false;
    this.client?.deactivate();
    this.client = null;
  }
}