package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.CreationUtilisateurRequest;
import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.Enum.StatutCollab;
import com.chahd.collabproject.Event.UtilisateurSuppressionEvent;
import com.chahd.collabproject.Exceptions.EmailDejaExistantException;
import com.chahd.collabproject.WebSocket.WebSocketEventListener;
import com.chahd.collabproject.entity.*;
import com.chahd.collabproject.repository.*;


import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.OffsetDateTime;
import java.util.*;
@Service

public class UtilisateurService {
    private final UtilisateurRepository utilisateurRepo ;
    private final ProjetService projetService ;
    private final ProjetRepository projetRepository ;
    private final TacheRepository tacheRepository ;
    private final EquipeRepository equipeRepository ;
    private final MembrePoleRepository membrePoleRepository ;
    private final PasswordEncoder passwordEncoder;
    private final MembreProjetRepository membreProjetRepository;
    private final MotDePasseGenerator motDePasseGenerator;
    private final EmailService emailService;
    private final ApplicationEventPublisher eventPublisher;
    public UtilisateurService(UtilisateurRepository utilisateurRepository, ProjetService projetService,
                              ProjetRepository projetRepository,
                              TacheRepository tacheRepository, EquipeRepository equipeRepository,
                              MembrePoleRepository membrePoleRepository, PasswordEncoder passwordEncoder,
                              MembreProjetRepository membreProjetRepository,
                              MotDePasseGenerator motDePasseGenerator, EmailService emailService,
                              ApplicationEventPublisher eventPublisher
                             ) {
        this.utilisateurRepo=utilisateurRepository;
        this.projetService=projetService;
        this.projetRepository=projetRepository;
        this.tacheRepository=tacheRepository;
        this.equipeRepository=equipeRepository;
        this.membrePoleRepository = membrePoleRepository;
        this.passwordEncoder = passwordEncoder;
        this.membreProjetRepository = membreProjetRepository;
        this.motDePasseGenerator= motDePasseGenerator;
        this.emailService=emailService;
        this.eventPublisher=eventPublisher;

    }
    public Optional<Utilisateur> loginUtilisateur(String email){
        return  this.utilisateurRepo.findByEmail(email);

    }
    @Transactional(readOnly = true)
    public List<UtilisateurDTO> getCollaborateursVisibles(Utilisateur currentUser) {
        // recharge l'utilisateur dans la session Hibernate active (évite LazyInitializationException)
        Utilisateur user = utilisateurRepo.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Utilisateur> visibles;

        if ("ADMINISTRATEUR".equals(user.getRole())) {
            visibles = utilisateurRepo.findAllByDateSuppressionIsNull();
        } else {
            Set<Utilisateur> set = new HashSet<>();
            for (Projet p : projetService.getProjets(user)) {
                set.add(p.getChefProjet());
                set.addAll(p.getCollaborateurs());
            }
            visibles = new ArrayList<>(set);
        }


        List<UtilisateurDTO> result = new ArrayList<>();
        for (Utilisateur u : visibles) {
            if (u.getDateSuppression() != null) continue;
            int nbProjets = membreProjetRepository.countByUtilisateurId(u.getId());
            int nbTaches = tacheRepository.countTachesForUser(u);

            result.add(UtilisateurDTO.FromUtilisateurAvecStats(u, nbProjets, nbTaches));}


        return result;
    }
    @Transactional
    public void affecterPoles(Utilisateur utilisateur, List<Integer> equipeIds) {
        for (int equipeId : equipeIds) {
            Equipe equipe = equipeRepository.findByIdAndDateSuppressionIsNull(equipeId)
                    .orElseThrow(() -> new EntityNotFoundException("Equipe n'existe pas"));

            MembrePole mp = new MembrePole();
            mp.setUtilisateur(utilisateur);
            mp.setEquipe(equipe);
            membrePoleRepository.save(mp);
        }
    }
    @Transactional
    public UtilisateurDTO creerUtilisateur(CreationUtilisateurRequest request)  {
        if (utilisateurRepo.existsByEmail(request.getEmail())) {
            throw new EmailDejaExistantException("Un compte existe déjà avec cet email : " + request.getEmail());
        }

        List<Equipe> equipes = new ArrayList<>();
        for (int id : request.getEquipeIds()) {
            Equipe equipe = equipeRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Equipe n'existe pas"));
            equipes.add(equipe);
        }

        String motDePasseClair = motDePasseGenerator.genererMotDePasseTemporaire();

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(motDePasseClair));
        utilisateur.setRole(request.getRole());
        utilisateur.setModeTravail(request.getModeTravail());
        utilisateur.setDateCreation(OffsetDateTime.now());
        utilisateur = utilisateurRepo.save(utilisateur);
        utilisateur.setStatutActivite(StatutCollab.HORS_LIGNE);
        affecterPoles(utilisateur, request.getEquipeIds());

        emailService.sendEmail(utilisateur, motDePasseClair);

        return UtilisateurDTO.fromUtilisateur(utilisateur);
    }
public void supprimer(int id){
    Utilisateur utilisateur = utilisateurRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Utilisateur n'existe pas"));
    utilisateur.setDateSuppression(OffsetDateTime.now());
    for(MembrePole mp : utilisateur.getMembresPoles()) {
        mp.setDateSuppression(OffsetDateTime.now());
    }

    for (MembreProjet mp : utilisateur.getMembresProjet()) {
        mp.setDateSuppression(OffsetDateTime.now());
    }
    for(AffectationTache af : utilisateur.getAffectationsTaches()){
        af.setDateSuppression(OffsetDateTime.now());
    }
    utilisateurRepo.save(utilisateur);
    eventPublisher.publishEvent(new UtilisateurSuppressionEvent(this, id));

}
    // UtilisateurService.java
    @Transactional(readOnly = true)
    public boolean estVisiblePour(Utilisateur acteur, Utilisateur cible) {
        if (acteur.getId() == cible.getId()) return true;
        if ("ADMINISTRATEUR".equals(acteur.getRole())) return true;

        for (Projet p : projetService.getProjets(acteur)) {
            boolean cibleEstChef = p.getChefProjet() != null && p.getChefProjet().getId() == cible.getId();
            boolean cibleEstMembre = p.getCollaborateurs().stream().anyMatch(c -> c.getId() == cible.getId());
            if (cibleEstChef || cibleEstMembre) return true;
        }
        return false;
    }

}
