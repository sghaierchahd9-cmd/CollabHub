package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.CommentaireDTO;
import com.chahd.collabproject.DTO.CommentaireRequestDTO;
import com.chahd.collabproject.Enum.TypeNotification;
import com.chahd.collabproject.entity.*;
import com.chahd.collabproject.repository.CommentaireRepository;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.TacheRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CommentaireService {
    private final CommentaireRepository commentaireRepository;
    private final TacheRepository tacheRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ProjetRepository projetRepository;
    public void supprimerCommentaire(Integer commentaireId, Utilisateur utilisateurConnecte) {
        Commentaire commentaire = commentaireRepository.findById(commentaireId)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire introuvable"));

        boolean estAuteur = commentaire.getUser().getId()== utilisateurConnecte.getId();
        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateurConnecte.getRole())
                || "CHEF_PROJET".equals(utilisateurConnecte.getRole());

        if (!estAuteur && !estAdminOuChef) {
            throw new AccessDeniedException("Vous ne pouvez supprimer que vos propres commentaires.");
        }

        commentaire.setDateSuppression(OffsetDateTime.now());
        commentaireRepository.save(commentaire);
        CommentaireDTO dtoEnregistre = CommentaireDTO.fromCommentaire(commentaire);
        String topic =  determinerTopic(commentaire);
        simpMessagingTemplate.convertAndSend(topic, dtoEnregistre);

        // Broadcast à TOUS ceux qui ont la tâche ouverte, mentionnés ou non


    }
    public List<CommentaireDTO> getCommentairesTache(Integer tacheId) {
        return commentaireRepository.findByTacheIdAndParentIsNullAndDateSuppressionIsNullOrderByDateCreationAsc(tacheId)
                .stream()
                .map(CommentaireDTO::fromCommentaire)
                .toList();
    }

// CommentaireService.java

    public CommentaireDTO ajouterCommentaireTache(Integer tacheId, CommentaireRequestDTO dto, Utilisateur auteur) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new EntityNotFoundException("Tâche introuvable"));

        verifierAcces(tache, auteur);

        Commentaire commentaire = new Commentaire();
        commentaire.setTache(tache);
        commentaire.setProjet(tache.getProjet()); // synchronisation garantie ici

        String messageNotifMention = "Vous avez été mentionné dans un commentaire pour la tâche : " + tache.getTitre();


        return finaliserCommentaire(commentaire, dto, auteur, messageNotifMention);
    }

    public CommentaireDTO ajouterCommentaireProjet(Integer projetId, CommentaireRequestDTO dto, Utilisateur auteur) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        verifierAccesProjet(projet, auteur);
        Commentaire commentaire = new Commentaire();
        commentaire.setTache(null);
        commentaire.setProjet(projet);

        String messageNotifMention = "Vous avez été mentionné dans un commentaire pour le projet : " + projet.getNom();


        return finaliserCommentaire(commentaire, dto, auteur, messageNotifMention);
    }
    public List<CommentaireDTO> getCommentairesProjet(Integer projetId, Utilisateur utilisateur) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        verifierAccesProjet(projet, utilisateur); // même garde qu'à la création

        return commentaireRepository.findByProjetIdAndTacheIdIsNullAndDateSuppressionIsNull(projetId)
                .stream()
                .map(CommentaireDTO::fromCommentaire)
                .toList();
    }


    private CommentaireDTO finaliserCommentaire(
            Commentaire commentaire,
            CommentaireRequestDTO dto,
            Utilisateur auteur,
            String messageNotifMention
    ) {
        commentaire.setContenu(dto.getContenu());
        commentaire.setUser(auteur);

        if (dto.getParentId() != null) {
            Commentaire parent = commentaireRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new EntityNotFoundException("Commentaire parent introuvable"));
            commentaire.setParent(parent);
        }

        if (dto.getMentionIds() != null && !dto.getMentionIds().isEmpty()) {
            List<Utilisateur> utilisateursMentionnes = utilisateurRepository.findAllById(dto.getMentionIds());
            commentaire.setMentions(new HashSet<>(utilisateursMentionnes));

            for (Utilisateur mentionne : utilisateursMentionnes) {
                Notification notif = new Notification();
                notif.setUser(mentionne);
                if(commentaire.isCommentaireDeProjet())
                notif.setTypeEvenement(TypeNotification.COMMENTAIRE_PROJET);
                else {
                    notif.setTypeEvenement(TypeNotification.COMMENTAIRE_TACHE);
                }
                notif.setMessage(messageNotifMention);
                if(commentaire.isCommentaireDeProjet())
                    notificationService.notifierCommentaireProjet(notif.getUser(),commentaire.getProjet().getNom(),auteur.getNom()+" "+auteur.getPrenom());
                else
                    notificationService.notifierCommentaireTache(notif.getUser(),commentaire.getTache().getTitre(),auteur.getNom()+" "+auteur.getPrenom(),commentaire.getProjet().getNom());


            }
        }

        Commentaire enregistre = commentaireRepository.save(commentaire);
        CommentaireDTO dtoEnregistre = CommentaireDTO.fromCommentaire(enregistre);

        simpMessagingTemplate.convertAndSend(determinerTopic(enregistre), dtoEnregistre);

        return dtoEnregistre;
    }

    private void verifierAcces(Tache tache, Utilisateur utilisateur) {
        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || "CHEF_PROJET".equals(utilisateur.getRole());
        boolean estResponsable = tache.getCollaborateurs().stream()
                .anyMatch(c -> c.getId()==utilisateur.getId());

        if (!estAdminOuChef && !estResponsable) {
            throw new AccessDeniedException("Vous n'avez pas accès à cette tâche.");
        }
    }
    private void verifierAccesProjet(Projet projet , Utilisateur utilisateur) {
        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || ("CHEF_PROJET".equals(utilisateur.getRole()) && ( utilisateur.getId()==projet.getChefProjet().getId()));
        boolean estMembre = projet.getCollaborateurs().stream()
                .anyMatch(c -> c.getId()==utilisateur.getId());

        if (!estAdminOuChef && !estMembre) {
            throw new AccessDeniedException("Vous n'avez pas accès à cette tâche.");
        }
    }
    public CommentaireDTO modifierCommentaire(Integer id, String contenu, List<Integer> mentionIds, Utilisateur utilisateur) {
        Commentaire cmnt = commentaireRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Commentaire introuvable"));

        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || "CHEF_PROJET".equals(utilisateur.getRole());
        boolean estAuteur = utilisateur.equals(cmnt.getUser());

        if (!estAdminOuChef && !estAuteur) {
            throw new AccessDeniedException("Vous n'avez pas accès à ce commentaire.");
        }

        cmnt.setContenu(contenu);

        Set<Utilisateur> nouvellesMentions = (mentionIds != null && !mentionIds.isEmpty())
                ? new HashSet<>(utilisateurRepository.findAllById(mentionIds))
                : new HashSet<>();

        Set<Utilisateur> mentionsAjoutees = new HashSet<>(nouvellesMentions);
        mentionsAjoutees.removeAll(cmnt.getMentions()); // ne notifier que les nouveaux venus

        cmnt.setMentions(nouvellesMentions);

        Commentaire enregistre = commentaireRepository.save(cmnt);
        CommentaireDTO dtoEnregistre = CommentaireDTO.fromCommentaire(enregistre);

        String messageNotifMention = determinerMessageMention(enregistre);
        for (Utilisateur mentionne : mentionsAjoutees) {
            Notification notif = new Notification();
            notif.setUser(mentionne);
            if(enregistre.isCommentaireDeProjet())
            notif.setTypeEvenement(TypeNotification.COMMENTAIRE_PROJET);
            else {
                notif.setTypeEvenement(TypeNotification.COMMENTAIRE_TACHE);
            }
            notif.setMessage(messageNotifMention);
            if(enregistre.isCommentaireDeProjet())
                notificationService.notifierCommentaireProjet(notif.getUser(),enregistre.getProjet().getNom(),utilisateur.getNom()+" "+utilisateur.getPrenom());
            else
                notificationService.notifierCommentaireTache(notif.getUser(),enregistre.getTache().getTitre(),utilisateur.getNom()+" "+utilisateur.getPrenom(),enregistre.getProjet().getNom());

        }

        simpMessagingTemplate.convertAndSend(determinerTopic(enregistre), dtoEnregistre);

        return dtoEnregistre;
    }

    // Extraite pour être réutilisée aussi dans finaliserCommentaire (voir plus bas)
    private String determinerMessageMention(Commentaire commentaire) {
        return commentaire.getTache() != null
                ? "Vous avez été mentionné dans un commentaire pour la tâche : " + commentaire.getTache().getTitre()
                : "Vous avez été mentionné dans un commentaire pour le projet : " + commentaire.getProjet().getNom();
    }

    // --- Méthode utilitaire réutilisable pour tout broadcast lié à un commentaire ---
    private String determinerTopic(Commentaire commentaire) {
        if (commentaire.getTache() != null) {
            return "/topic/taches/" + commentaire.getTache().getId() + "/commentaires";
        } else {
            return "/topic/projets/" + commentaire.getProjet().getId() + "/commentaires";
        }
    }

}
