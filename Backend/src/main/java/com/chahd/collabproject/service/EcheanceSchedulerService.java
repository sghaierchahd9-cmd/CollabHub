package com.chahd.collabproject.service;

import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.TacheRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EcheanceSchedulerService {
    private final TacheRepository tacheRepository;
    private final NotificationService notificationService;
    private final ProjetRepository projetRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Scheduled(cron = "0 55 09 * * * ")
    @Transactional
    public void verifierEcheances() {
        LocalDate demain = LocalDate.now().plusDays(1);
        LocalDate hier = LocalDate.now().minusDays(1);

        for (Tache t : tacheRepository.findEcheancesDemain(demain)) {
            for (Utilisateur collab : t.getCollaborateurs()) {
                notificationService.notifierEcheanceProche(collab, t.getTitre(), t.getProjet().getNom());
            }
        }

        for (Tache t : tacheRepository.findTachesEnRetardHier(hier)) {
            for (Utilisateur collab : t.getCollaborateurs()) {
                notificationService.notifierEcheanceDepassee(collab, t.getTitre(), t.getProjet().getNom());
            }
            notificationService.notifierEcheanceDepassee(t.getProjet().getChefProjet(), t.getTitre(), t.getProjet().getNom());
        }
        for(Projet p: projetRepository.findProjetsEnRetardHier(hier)){
            notificationService.projetRetard(p.getChefProjet(), p.getNom());
            List<Utilisateur> admins = utilisateurRepository.findByRoleAndDateSuppressionIsNull("ADMINISTRATEUR");
            for (Utilisateur admin : admins) {
                notificationService.projetRetard(admin,p.getNom());
            }
        }
        for(Projet p: projetRepository.findEcheancesDemain(demain)){
            notificationService.projetEcheanceProche(p.getChefProjet(), p.getNom());
            List<Utilisateur> admins = utilisateurRepository.findByRoleAndDateSuppressionIsNull("ADMINISTRATEUR");
            for (Utilisateur admin : admins) {
                notificationService.projetEcheanceProche(admin,p.getNom());
            }
        }
    }
}