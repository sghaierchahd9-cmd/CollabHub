package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.ProjetDTO;
import com.chahd.collabproject.Enum.ActivityType;
import com.chahd.collabproject.entity.ActivityLog;
import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import com.chahd.collabproject.service.ProjetService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.springframework.security.authorization.AuthorityReactiveAuthorizationManager.hasAnyRole;


@RestController
@RequestMapping("api/projets")
public class ProjetController {
    private final ProjetRepository projetRepository;
    private final ProjetService projetService;
    private final UtilisateurRepository utilisateurRepository;
    public ProjetController(ProjetRepository projetRepository, UtilisateurRepository utilisateurRepository, ProjetService projetService) {
        this.projetRepository = projetRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.projetService = projetService;
    }
    @GetMapping()
    public List<ProjetDTO> getProjet(Authentication authentication){
        Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();
        List<Projet> projets = new ArrayList<>();
        if(utilisateur.getRole().equals("ADMINISTRATEUR")){
            projets= projetRepository.findAll();
        }
        else{
             projets= projetService.getProjets(utilisateur);
        }
        List<ProjetDTO> projetDTOs = new ArrayList<>();
        for(Projet projet : projets){
            projetDTOs.add(ProjetDTO.fromentity(projet));
        }
        return projetDTOs;
    }
    @PostMapping()
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR','CHEF_PROJET')")
    public ResponseEntity<?> creerProjet(@RequestBody ProjetDTO dto,@AuthenticationPrincipal Utilisateur utilisateur) {
        utilisateur = utilisateurRepository.findById(utilisateur.getId()).orElseThrow(()-> new EntityNotFoundException("utilisateur not found"));
        Projet projet = projetService.creerProjet(dto,utilisateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(ProjetDTO.fromentity(projet));
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjetDTO> getProjetById(@PathVariable int id, Authentication authentication){
        Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();

        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));

        boolean estMembre = projet.getCollaborateurs().stream().anyMatch(u -> u.getId() == utilisateur.getId());

        if ("ADMINISTRATEUR".equals(utilisateur.getRole()) || projet.getChefProjet().equals(utilisateur) || estMembre) {
            return ResponseEntity.ok(ProjetDTO.fromentity(projet));
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @PutMapping("/{id}")
    public ProjetDTO updateProjet(@PathVariable int id, @RequestBody ProjetDTO dto,Authentication authentication){
        Utilisateur acteur = (Utilisateur) authentication.getPrincipal();
        return  projetService.updateProjet(id,dto,acteur);
    }
    @GetMapping("/membre/{id}")
    public ResponseEntity<List<ProjetDTO>> getProjetByMembre(@PathVariable int id){
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow(()->new EntityNotFoundException("user not found"));
        List<Projet> projets=projetService.getProjets(user);
        List<ProjetDTO> projetDTOs=new ArrayList<>();
        for(Projet projet : projets){
            projetDTOs.add(ProjetDTO.fromentity(projet));
        }
        return ResponseEntity.ok(projetDTOs);

    }



}
