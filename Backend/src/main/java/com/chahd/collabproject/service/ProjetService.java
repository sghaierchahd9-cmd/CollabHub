package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.ProjetDTO;
import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.Enum.ActivityType;
import com.chahd.collabproject.entity.ActivityLog;
import com.chahd.collabproject.entity.MembreProjet;
import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.ActivityLogRepository;
import com.chahd.collabproject.repository.MembreProjetRepository;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjetService {
        private final ProjetRepository projetRepository;
        private final UtilisateurRepository utilisateurRepository;
        private final ActivityLogRepository activityLogRepository;
        private final MembreProjetRepository membreProjetRepository;
        private final NotificationService notificationService;
        public ProjetService(ProjetRepository projetRepository, UtilisateurRepository utilisateurRepository,
                             ActivityLogRepository activityLogRepository, MembreProjetRepository membreProjetRepository,
                             NotificationService notificationService) {
            this.projetRepository = projetRepository;
            this.utilisateurRepository = utilisateurRepository;
            this.activityLogRepository = activityLogRepository;
            this.membreProjetRepository = membreProjetRepository;
            this.notificationService = notificationService;
        }

        public List<Utilisateur> getEquipe( Utilisateur user){
            List<Projet> projets = getProjets(user);
            Set<Utilisateur> members= new HashSet<Utilisateur>();
            for(Projet projet : projets ){
                members.addAll(projet.getCollaborateurs());

            }

            return new ArrayList<>(members) ;
        }
    public List<Projet> getProjets(Utilisateur user){
        if ("CHEF_PROJET".equals(user.getRole())) {
            return projetRepository.findByChefProjet(user);
        }

        return membreProjetRepository.findByUtilisateurIdAndDateSuppressionIsNull(user.getId()).stream()
                .map(MembreProjet::getProjet)
                .distinct()
                .toList();
    }
    @Transactional
    public Projet creerProjet(ProjetDTO projet,Utilisateur acteur){
            if(!peutCreer(acteur)){
                throw new AccessDeniedException("Access denied");
            }
        Projet new_project = new Projet();
        new_project.setDateCreation(projet.getDateCreation());
        new_project.setDateDebut(projet.getDateDebut());
        new_project.setDescription(projet.getDescription());
        new_project.setNom(projet.getNom());
        new_project.setStatut(projet.getStatut());
        new_project.setObjectifs(projet.getObjectifs());
        new_project.setDateFinPrevue(projet.getDateFinPrevue());
        new_project.setNiveauPriorite(projet.getNiveauPriorite());

        Utilisateur user = utilisateurRepository.findById(projet.getChefProjet())
                .orElseThrow(() -> new EntityNotFoundException("Chef de projet introuvable"));
        new_project.setChefProjet(user);

        new_project = projetRepository.save(new_project); // save d'abord pour obtenir l'id

        List<Utilisateur> collaborateurs = utilisateurRepository.findAllById(projet.getCollaborateurIds());
        for (Utilisateur collab : collaborateurs) {
            MembreProjet mp = new MembreProjet();
            mp.setProjet(new_project);
            mp.setUtilisateur(collab);
            membreProjetRepository.save(mp);
        }
        List<Utilisateur> admins=utilisateurRepository.findByRoleAndDateSuppressionIsNull("ADMINISTRATEUR");
        for (Utilisateur admin : admins) {
            if(!admin.equals(user)){
          this.notificationService.creerProjet(admin,new_project.getNom(),user.getNom()+" "+user.getPrenom());}}

        return new_project;
    }




    @Transactional
    public void ajouterMembre(int projetId, int utilisateurId, Utilisateur acteur) {

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        Utilisateur membre = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        if(!peutModifier(acteur,projet)){
            throw new AccessDeniedException("Access denied");
        }
        boolean dejaMembreActif = membreProjetRepository
                .findByProjetIdAndUtilisateurIdAndDateSuppressionIsNull(projetId, utilisateurId)
                .isPresent();
        if (dejaMembreActif) {
            return; // deja membre actif, rien a faire (evite un doublon actif sur la meme paire)
        }

        MembreProjet mp = new MembreProjet();
        mp.setProjet(projet);
        mp.setUtilisateur(membre);
        membreProjetRepository.save(mp);

        ActivityLog log = new ActivityLog();
        log.setType(ActivityType.AJOUT_MEMBRE);
        log.setActeur(acteur);
        log.setProjet(projet);
        log.setMembreConcerne(membre);
        log.setDateEvenement(LocalDateTime.now());
        activityLogRepository.save(log);
        List<Utilisateur> admins=utilisateurRepository.findByRoleAndDateSuppressionIsNull("ADMINISTRATEUR");
        for (Utilisateur admin : admins) {
            if(!admin.equals(acteur)){
            this.notificationService.modifierProjet(admin,projet.getNom(),acteur.getNom()+" "+acteur.getPrenom());}}

    }

    @Transactional
    public void desaffecterMembre(int projetId, int utilisateurId, Utilisateur acteur) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        Utilisateur membre = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));
        if(!peutModifier(acteur,projet)){
            throw new AccessDeniedException("Access denied");
        }
        MembreProjet mp = membreProjetRepository
                .findByProjetIdAndUtilisateurIdAndDateSuppressionIsNull(projetId, utilisateurId)
                .orElseThrow(() -> new IllegalArgumentException("Ce membre n'est pas actif sur ce projet"));

        mp.setDateSuppression(OffsetDateTime.now());
        membreProjetRepository.save(mp);

        ActivityLog log = new ActivityLog();
        log.setType(ActivityType.DESAFFECTER_MEMBRE);
        log.setActeur(acteur);
        log.setProjet(projet);
        log.setMembreConcerne(membre);
        log.setDateEvenement(LocalDateTime.now());
        activityLogRepository.save(log);
        List<Utilisateur> admins=utilisateurRepository.findByRoleAndDateSuppressionIsNull("ADMINISTRATEUR");
        for (Utilisateur admin : admins) {
            if(!admin.equals(acteur)){
            this.notificationService.modifierProjet(admin,projet.getNom(),acteur.getNom()+" "+acteur.getPrenom());}}

    }


    @Transactional
    public ProjetDTO updateProjet(int id, ProjetDTO dto, Utilisateur acteur){
        Projet p = projetRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("projet not found"));
        if(!peutModifier(acteur,p)){
            throw new AccessDeniedException("Access denied");
        }
        p.setNom(dto.getNom());
        p.setDescription(dto.getDescription());
        Utilisateur user = utilisateurRepository.findById(dto.getChefProjet()).orElseThrow(() -> new EntityNotFoundException("chefProjet non trouvé"));
        p.setChefProjet(user);
        p.setNiveauPriorite(dto.getNiveauPriorite());
        p.setDateFinPrevue(dto.getDateFinPrevue());
        p.setStatut(dto.getStatut());
        p.setDateDebut(dto.getDateDebut());
        projetRepository.save(p);

        List<MembreProjet> membresActifs = membreProjetRepository.findByProjetIdAndDateSuppressionIsNull(id);
        Set<Integer> idsExistants = membresActifs.stream()
                .map(mp -> mp.getUtilisateur().getId())
                .collect(Collectors.toSet());

        // Ajouts
        for (int collabId : dto.getCollaborateurIds()) {
            if (!idsExistants.contains(collabId)) {
                Utilisateur collab = utilisateurRepository.findById(collabId)
                        .orElseThrow(() -> new EntityNotFoundException("colaborateur non trouvé"));

                MembreProjet mp = new MembreProjet();
                mp.setProjet(p);
                mp.setUtilisateur(collab);
                membreProjetRepository.save(mp);

                ActivityLog activityLog = new ActivityLog();
                activityLog.setProjet(p);
                activityLog.setActeur(acteur);
                activityLog.setDateEvenement(LocalDateTime.now());
                activityLog.setMembreConcerne(collab);
                activityLog.setType(ActivityType.AJOUT_MEMBRE);
                activityLogRepository.save(activityLog);
            }

        }

        // Retraits
        for (MembreProjet mp : membresActifs) {
            if (!dto.getCollaborateurIds().contains(mp.getUtilisateur().getId())) {
                mp.setDateSuppression(OffsetDateTime.now());
                membreProjetRepository.save(mp);

                ActivityLog activityLog = new ActivityLog();
                activityLog.setProjet(p);
                activityLog.setActeur(acteur);
                activityLog.setDateEvenement(LocalDateTime.now());
                activityLog.setMembreConcerne(mp.getUtilisateur());
                activityLog.setType(ActivityType.DESAFFECTER_MEMBRE);
                activityLogRepository.save(activityLog);
            }
        }
        List<Utilisateur> admins=utilisateurRepository.findByRoleAndDateSuppressionIsNull("ADMINISTRATEUR");
        for (Utilisateur admin : admins) {
            if(!admin.equals(acteur)){
            this.notificationService.modifierProjet(admin,p.getNom(),acteur.getNom()+" "+acteur.getPrenom());}}

        return ProjetDTO.fromentity(p);
    }
    private boolean peutCreer(Utilisateur utilisateur) {
            return "ADMINISTRATEUR".equals(utilisateur.getRole()) || "CHEF_PROJET".equals(utilisateur.getRole());
    }
    private boolean peutModifier(Utilisateur utilisateur,Projet projet) {
            boolean estResponsable = "CHEF_PROJET".equals(utilisateur.getRole()) && projet.getChefProjet().equals(utilisateur);
            return estResponsable || "ADMINISTRATEUR".equals(utilisateur.getRole()) ;

    }
}
