package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.EvenementResume;
import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.ResumeIa;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.ResumeIaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeIaService {

    private final ResumeIaCollecteService collecteService;
    private final PromptIaService promptService;
    private final GroqClientService groqClientService;
    private final ResumeIaRepository resumeIaRepository;
    private final ProjetRepository projetRepository;

    @Transactional
    public String obtenirResume(Integer projetId, Utilisateur utilisateur, boolean forcerRegeneration) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        verifierAcces(projet, utilisateur);

        ResumeIa existant = resumeIaRepository.findByProjetId(projetId).orElse(null);

        if (existant != null && !forcerRegeneration) {
            return existant.getContenu(); // on sert le cache, pas de nouvel appel API
        }

        List<EvenementResume> evenements = collecteService.collecterEvenements(projetId);
        String promptSysteme = promptService.construirePromptSysteme();
        String promptUtilisateur = promptService.construirePromptUtilisateur(projet.getNom(), evenements);

        String contenu = groqClientService.genererResume(promptSysteme, promptUtilisateur);

        ResumeIa resume = (existant != null) ? existant : new ResumeIa();
        resume.setProjet(projet);
        resume.setContenu(contenu);
        resume.setDateGeneration(OffsetDateTime.now());
        resumeIaRepository.save(resume);

        return contenu;
    }

    private void verifierAcces(Projet projet, Utilisateur utilisateur) {
        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || ("CHEF_PROJET".equals(utilisateur.getRole()) && projet.getChefProjet().getId() == utilisateur.getId());
        boolean estMembre = projet.getCollaborateurs().stream()
                .anyMatch(c -> c.getId() == utilisateur.getId());

        if (!estAdminOuChef && !estMembre) {
            throw new AccessDeniedException("Vous n'avez pas accès au résumé de ce projet.");
        }
    }
}