package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.NotificationDTO;
import com.chahd.collabproject.Enum.TypeNotification;
import com.chahd.collabproject.entity.Notification;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final NotificationRepository notificationRepository;

    public void notifierCommentaireTache(Utilisateur destinataire, String titreTache, String auteurNom,String projet) {
        envoyer(destinataire, TypeNotification.COMMENTAIRE_TACHE,
                auteurNom + " vous a mentionné dans un commentaire sur la tâche \"" + titreTache + "\"" + "pour le  Projet " + projet);
    }

    public void notifierCommentaireProjet(Utilisateur destinataire, String nomProjet, String auteurNom) {
        envoyer(destinataire, TypeNotification.COMMENTAIRE_PROJET,
                auteurNom + " vous a mentionné dans un commentaire sur le projet \"" + nomProjet + "\"");
    }

    public void notifierAffectationTache(Utilisateur destinataire, String titreTache,String projet) {
        envoyer(destinataire, TypeNotification.AFFECTATION_TACHE,
                "Vous avez été affecté(e) à la tâche \"" + titreTache + "\""  + "pour le  Projet " + projet);
    }

    public void notifierRetraitTache(Utilisateur destinataire, String titreTache,String projet) {
        envoyer(destinataire, TypeNotification.RETRAIT_TACHE,
                "Vous avez été retiré(e) de la tâche \"" + titreTache + "\""  + "pour le  Projet " + projet);
    }

    public void notifierTacheBloquee(Utilisateur destinataire, String titreTache, String auteurNom,String projet) {
        envoyer(destinataire, TypeNotification.TACHE_BLOQUEE,
                auteurNom + " a marqué la tâche \"" + titreTache + "\" comme bloquée "+ "\" pour le  Projet " + projet);
    }
   public void notifierAttacherPieceJointe(Utilisateur destinataire, String titreTache, String auteurNom,String projet) {
        envoyer(destinataire,TypeNotification.ATTACHER_PIECEJOINTE,auteurNom + " a attaché une piece jointe " + " pour la tache \"" + titreTache +  "\" pour le  Projet " + projet);
   }
    public void notifierSupprimerPieceJointe(Utilisateur destinataire, String titreTache,String nomFichier, String auteurNom,String projet) {
        envoyer(destinataire,TypeNotification.SUPPRIMER_PIECEJOINTE,auteurNom + " a supprimé la piece jointe " +nomFichier+ " pour la tache \"" + titreTache +  "\" pour le  Projet " + projet);
    }
    public void creerProjet(Utilisateur destinataire,String nomProjet,String auteurNom){
        envoyer(destinataire,TypeNotification.CREER_PROJET,auteurNom + " a creé le projet  " +nomProjet);

    }
    public void modifierProjet(Utilisateur destinataire,String nomProjet,String auteurNom){
        envoyer(destinataire,TypeNotification.MODIFIER_PROJET,auteurNom + " a modifié le projet  " +nomProjet);

    }
    public void notifierEcheanceProche(Utilisateur destinataire, String titreTache, String projet) {
        envoyer(destinataire, TypeNotification.ECHEANCE_PROCHE,
                "La tâche \"" + titreTache + "\" arrive à échéance bientôt pour le Projet " + projet);
    }

    public void notifierEcheanceDepassee(Utilisateur destinataire, String titreTache, String projet) {
        envoyer(destinataire, TypeNotification.ECHEANCE_DEPASSEE,
                "La tâche \"" + titreTache + "\" a dépassé son échéance pour le Projet " + projet);
    }
    public void projetRetard(Utilisateur destinataire, String projet) {
        envoyer(destinataire, TypeNotification.ECHEANCE_DEPASSEE,
                " le projet \""+ projet+"\" a dépassé son échéance  " );
    }
    public void projetEcheanceProche(Utilisateur destinataire, String projet) {
        envoyer(destinataire, TypeNotification.ECHEANCE_PROCHE,
                " le projet \""+ projet+"\"  arrive à échéance bientôt  " );
    }




    private void envoyer(Utilisateur destinataire, TypeNotification type, String message) {
        Notification notif = new Notification();
        notif.setUser(destinataire);
        notif.setTypeEvenement(type);
        notif.setMessage(message);
        notif.setDateGeneration(OffsetDateTime.now());
        notif.setEstLue(false);
        Notification saved = notificationRepository.save(notif);

        simpMessagingTemplate.convertAndSendToUser(
                destinataire.getEmail(),
                "/queue/notifications",
                NotificationDTO.fromNotification(saved)
        );
    }
}
