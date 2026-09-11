package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.TacheDTO;
import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.Enum.ActivityType;
import com.chahd.collabproject.Enum.TypeNotification;
import com.chahd.collabproject.entity.*;
import com.chahd.collabproject.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class TacheService {

    private final UtilisateurRepository userRepo;
    private final ProjetService projetService;
    private final TacheRepository tacheRepo;
    private final ActivityLogRepository activityLogRepository;
    public final ProjetRepository projetRepo;
    private final AffectationTacheRepository affectationTacheRepo;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate simpMessagingTemplate;



    @Transactional(readOnly = true)
    public List<Tache> getTaches(Utilisateur user){


        List<Tache> taches = new ArrayList<>();
        if ("CHEF_PROJET".equals(user.getRole())) {
            List<Projet> projets = projetService.getProjets(user);
            for (Projet projet : projets) {
                taches.addAll(tacheRepo.findTacheByProjet(projet));
            }
        } else {
            taches = tacheRepo.findTacheByUser(user);
        }
        return taches;
    }

    @Transactional
    public TacheDTO creerTache(TacheDTO tacheDTO, Utilisateur acteur) {
        Projet projet = projetRepo.findById(tacheDTO.getProjetId())
                .orElseThrow(() -> new EntityNotFoundException("Projet n'existe pas"));

        Tache new_tache = new Tache();
        new_tache.setProjet(projet);
        new_tache.setStatut(tacheDTO.getStatut());
        new_tache.setPriorite(tacheDTO.getPriorite());
        new_tache.setDateDebut(tacheDTO.getDateDebut());
        new_tache.setEcheance(tacheDTO.getEcheance());
        new_tache.setDescription(tacheDTO.getDescription());
        new_tache.setTitre(tacheDTO.getTitre());
        new_tache.setDateCreation(tacheDTO.getDateCreation());

        Tache saved = tacheRepo.save(new_tache);

        // Création des affectations (remplace setCollaborateurs(utilisateurs))
        for (UtilisateurDTO collabDTO : tacheDTO.getCollaborateurs()) {
            Utilisateur collaborateur = userRepo.findById(collabDTO.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Utilisateur n'existe pas"));
            AffectationTache affectation = new AffectationTache();
            affectation.setTache(saved);
            affectation.setCollaborateur(collaborateur);
            affectationTacheRepo.save(affectation);

            if (!(collaborateur.getId()==acteur.getId())) { // pas de self-notif
                Notification notif = new Notification();
                notif.setUser(collaborateur);
                notif.setTypeEvenement(TypeNotification.AFFECTATION_TACHE);
                notif.setMessage("Vous avez été affecté à la tâche : " + saved.getTitre());
                notificationService.notifierAffectationTache(notif.getUser(),saved.getTitre(),affectation.getTache().getProjet().getNom());
            }
        }

        ActivityLog log = new ActivityLog();
        log.setType(ActivityType.CREATION_TACHE);
        log.setActeur(acteur);
        log.setTache(saved);
        log.setProjet(saved.getProjet());
        log.setDateEvenement(LocalDateTime.now());
        activityLogRepository.save(log);

        TacheDTO dto = TacheDTO.fromTache(saved);
        simpMessagingTemplate.convertAndSend(
                "/topic/projets/" + saved.getProjet().getId() + "/taches",
                dto
        );
        return dto;
    }

    // modifierStatutTache : inchangé, ne touche pas aux collaborateurs

    @Transactional
    public TacheDTO modifierTacheComplete(int tacheId, TacheDTO dto, Utilisateur acteur) {
        Tache tache = tacheRepo.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable"));
        verifierDroitModificationTache(tache, acteur);
        String ancienStatut = tache.getStatut();

        tache.setTitre(dto.getTitre());
        tache.setDescription(dto.getDescription());
        tache.setPriorite(dto.getPriorite());
        tache.setStatut(dto.getStatut());
        tache.setEcheance(dto.getEcheance());
        tacheRepo.save(tache);
        if ("BLOQUEE".equals(tache.getStatut()) && !"BLOQUEE".equals(ancienStatut)) {
            Utilisateur chefProjet = tache.getProjet().getChefProjet();
            if (chefProjet != null && chefProjet.getId() != acteur.getId()) {
                notificationService.notifierTacheBloquee(
                        chefProjet,
                        tache.getTitre(),
                        acteur.getNom()+" "+acteur.getPrenom(),
                        tache.getProjet().getNom()
                );
            }
        }

        // Plus de réassignation directe de liste : on synchronise via AffectationTache
        List<AffectationTache> affectationsActuelles =
                affectationTacheRepo.findByTacheIdAndDateSuppressionIsNull(tacheId);

        Set<Integer> idsActuels = affectationsActuelles.stream()
                .map(a -> a.getCollaborateur().getId())
                .collect(Collectors.toSet());

        Set<Integer> idsNouveaux = dto.getCollaborateurs().stream()
                .map(UtilisateurDTO::getId)
                .collect(Collectors.toSet());

        // Soft delete des collaborateurs retirés
        // Soft delete des collaborateurs retirés
        for (AffectationTache affectation : affectationsActuelles) {
            if (!idsNouveaux.contains(affectation.getCollaborateur().getId())) {
                affectation.setDateSuppression(OffsetDateTime.now());
                affectationTacheRepo.save(affectation);

                Utilisateur collaborateurRetire = affectation.getCollaborateur();
                if (!(collaborateurRetire.getId()==acteur.getId())) {
                    Notification notif = new Notification();
                    notif.setUser(collaborateurRetire);
                    notif.setTypeEvenement(TypeNotification.RETRAIT_TACHE);
                    notif.setMessage("Vous avez été retiré de la tâche : " + tache.getTitre());
                    notificationService.notifierRetraitTache(notif.getUser(),tache.getTitre(),tache.getProjet().getNom());
                }
            }
        }

// Ajout des collaborateurs nouvellement sélectionnés
        for (Integer id : idsNouveaux) {
            if (!idsActuels.contains(id)) {
                Utilisateur collaborateur = userRepo.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("collaborateur non trouvé"));
                AffectationTache nouvelle = new AffectationTache();
                nouvelle.setTache(tache);
                nouvelle.setCollaborateur(collaborateur);
                affectationTacheRepo.save(nouvelle);

                if (!(collaborateur.getId()==acteur.getId())) {
                    Notification notif = new Notification();
                    notif.setUser(collaborateur);
                    notif.setTypeEvenement(TypeNotification.AFFECTATION_TACHE);
                    notif.setMessage("Vous avez été affecté à la tâche : " + tache.getTitre());
                    notificationService.notifierAffectationTache(notif.getUser(),tache.getTitre(),tache.getProjet().getNom());
                }
            }
        }

        ActivityLog log = new ActivityLog();
        log.setType(ActivityType.MODIFICATION_TACHE);
        log.setActeur(acteur);
        log.setTache(tache);
        log.setProjet(tache.getProjet());
        log.setAncienneValeur(ancienStatut);
        log.setNouvelleValeur(dto.getStatut());
        log.setDateEvenement(LocalDateTime.now());
        activityLogRepository.save(log);

        TacheDTO new_dto = TacheDTO.fromTache(tache);
        simpMessagingTemplate.convertAndSend(
                "/topic/projets/" + tache.getProjet().getId() + "/taches",
                new_dto
        );
        return new_dto;
    }

    public List<TacheDTO> getTachesParMembreEtProjet(int projetId, int membreId, Utilisateur acteur) {
        if ("COLLABORATEUR".equals(acteur.getRole())) {
            throw new AccessDeniedException("Accès non autorisé");
        }


        List<Tache> taches = tacheRepo.findByProjetIdAndCollaborateurActif(projetId, membreId);
        return taches.stream().map(TacheDTO::fromTache).toList();
    }

    public TacheDTO mettreAJourAvancement(Integer tacheId, Double tauxAvancement, Utilisateur utilisateurConnecte) {
        Tache tache = tacheRepo.findById(tacheId)
                .orElseThrow(() -> new EntityNotFoundException("Tâche introuvable"));

        verifierDroitModificationAvancement(tache, utilisateurConnecte);

        if (tauxAvancement < 0 || tauxAvancement > 100) {
            throw new IllegalArgumentException("Le taux d'avancement doit être compris entre 0 et 100.");
        }

        tache.setTauxAvancement(tauxAvancement);
        Tache tacheMiseAJour = tacheRepo.save(tache);

        TacheDTO new_dto = TacheDTO.fromTache(tacheMiseAJour);
        simpMessagingTemplate.convertAndSend(
                "/topic/projets/" + tache.getProjet().getId() + "/taches",
                new_dto
        );
        return new_dto;
    }

    private void verifierDroitModificationAvancement(Tache tache, Utilisateur utilisateur) {

        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || "CHEF_PROJET".equals(utilisateur.getRole());

        boolean estResponsableAssigne = tache.getCollaborateurs().stream()
                .anyMatch(c -> c.getId() == utilisateur.getId());

        if (!estAdminOuChef && !estResponsableAssigne) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier l'avancement de cette tâche.");
        }
    }
    public Tache modifierStatutTache(int tacheId, String statut, Utilisateur acteur) {
        Tache tache = tacheRepo.findById(tacheId)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable"));
        verifierDroitChangerStatut(tache, acteur);
        String ancienStatut = tache.getStatut();
        tache.setStatut(statut);
        tacheRepo.save(tache);

        // Notification de blocage : uniquement sur la transition vers BLOQUEE
        if ("BLOQUEE".equals(statut) && !"BLOQUEE".equals(ancienStatut)) {
            Utilisateur chefProjet = tache.getProjet().getChefProjet();
            if (chefProjet != null && chefProjet.getId() != acteur.getId()) {
                notificationService.notifierTacheBloquee(
                        chefProjet,
                        tache.getTitre(),
                        acteur.getNom()+acteur.getPrenom(),tache.getProjet().getNom() // ou getPrenom()+" "+getNom() selon ton entité Utilisateur
                );
            }
        }

        ActivityLog log = new ActivityLog();
        log.setType(ActivityType.MODIFICATION_TACHE);
        log.setActeur(acteur);
        log.setTache(tache);
        log.setProjet(tache.getProjet());
        log.setAncienneValeur(ancienStatut);
        log.setNouvelleValeur(statut);
        log.setDateEvenement(LocalDateTime.now());
        activityLogRepository.save(log);


        simpMessagingTemplate.convertAndSend(
                "/topic/projets/" + tache.getProjet().getId() + "/taches",
                TacheDTO.fromTache(tache)
        );
        return tache;
    }

    private void verifierDroitModificationTache(Tache tache, Utilisateur acteur) {
        boolean estAdmin = "ADMINISTRATEUR".equals(acteur.getRole());
        boolean estChefDuProjet = "CHEF_PROJET".equals(acteur.getRole())
                && tache.getProjet().getChefProjet().getId() == acteur.getId();
        if (!estAdmin && !estChefDuProjet) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à modifier cette tâche.");
        }
    }

    private void verifierDroitChangerStatut(Tache tache, Utilisateur acteur) {
        boolean estAdmin = "ADMINISTRATEUR".equals(acteur.getRole());
        boolean estChefDuProjet = "CHEF_PROJET".equals(acteur.getRole())
                && tache.getProjet().getChefProjet().getId() == acteur.getId();
        boolean estAffecte = tache.getCollaborateurs().stream()
                .anyMatch(c -> c.getId() == acteur.getId());
        if (!estAdmin && !estChefDuProjet && !estAffecte) {
            throw new AccessDeniedException("Vous n'êtes pas autorisé à changer le statut de cette tâche.");
        }
    }
}
