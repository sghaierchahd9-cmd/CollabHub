package com.chahd.collabproject.Controller;

import com.chahd.collabproject.entity.Equipe;
import com.chahd.collabproject.entity.MembrePole;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.repository.EquipeRepository;
import com.chahd.collabproject.repository.MembrePoleRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import com.chahd.collabproject.service.EquipeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/equipes")
public class EquipeController {

    private final EquipeRepository equipeRepository;
    private final MembrePoleRepository membrePoleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final EquipeService equipeService;

    public EquipeController(EquipeRepository equipeRepository,
                            MembrePoleRepository membrePoleRepository,
                            UtilisateurRepository utilisateurRepository,EquipeService equipeService) {
        this.equipeRepository = equipeRepository;
        this.membrePoleRepository = membrePoleRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.equipeService = equipeService;
    }

    @GetMapping()
    public List<Equipe> findAllEquipes() {
        return equipeRepository.findAllByDateSuppressionIsNull();
    }

    @PostMapping()
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public Equipe save(@RequestBody Equipe equipe) {
        return equipeRepository.save(equipe);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        return equipeService.deleteById(id);
    }

    // ---- NOUVEAU : modification nom / description ----
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Equipe> update(@PathVariable int id, @RequestBody Equipe equipeModifiee) {
        return equipeRepository.findById(id)
                .map(equipe -> {
                    equipe.setNom(equipeModifiee.getNom());
                    equipe.setDescription(equipeModifiee.getDescription());
                    return ResponseEntity.ok(equipeRepository.save(equipe));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ---- NOUVEAU : affecter un membre au pôle ----
    @PostMapping("/{id}/membres/{userId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<?> ajouterMembre(@PathVariable int id, @PathVariable int userId) {
        Equipe equipe = equipeRepository.findById(id).orElse(null);
        if (equipe == null) return ResponseEntity.notFound().build();

        Utilisateur utilisateur = utilisateurRepository.findById(userId).orElse(null);
        if (utilisateur == null) return ResponseEntity.notFound().build();

        Optional<MembrePole> existant = membrePoleRepository
                .findByUtilisateurIdAndEquipeIdAndDateSuppressionIsNull(userId, id);
        if (existant.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cet utilisateur fait déjà partie de ce pôle.");
        }

        MembrePole membrePole = new MembrePole();
        membrePole.setUtilisateur(utilisateur);
        membrePole.setEquipe(equipe);
        membrePoleRepository.save(membrePole);

        return ResponseEntity.ok(UtilisateurDTO.fromUtilisateurLight(utilisateur));
    }

    // ---- NOUVEAU : retirer un membre du pôle ----
    @DeleteMapping("/{id}/membres/{userId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> retirerMembre(@PathVariable int id, @PathVariable int userId) {
        return membrePoleRepository.findByUtilisateurIdAndEquipeIdAndDateSuppressionIsNull(userId, id)
                .map(mp -> {
                    mp.setDateSuppression(OffsetDateTime.now());
                    membrePoleRepository.save(mp);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
