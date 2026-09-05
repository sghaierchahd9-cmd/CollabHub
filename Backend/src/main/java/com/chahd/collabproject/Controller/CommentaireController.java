package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.CommentaireDTO;
import com.chahd.collabproject.DTO.CommentaireRequestDTO;
import com.chahd.collabproject.entity.Commentaire;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.CommentaireRepository;
import com.chahd.collabproject.service.CommentaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commentaires")
@RequiredArgsConstructor
public class CommentaireController {

    private final CommentaireService commentaireService;
    private final CommentaireRepository commentaireRepository;

    @GetMapping("/tache/{tacheId}")
    public ResponseEntity<List<CommentaireDTO>> getCommentaires(@PathVariable Integer tacheId) {
        return ResponseEntity.ok(commentaireService.getCommentairesTache(tacheId));
    }
    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<CommentaireDTO>> getCommentairesProjet(
            @PathVariable Integer projetId,
            @AuthenticationPrincipal Utilisateur utilisateur
    ) {
        return ResponseEntity.ok(commentaireService.getCommentairesProjet(projetId, utilisateur));
    }

    @PostMapping("/tache/{tacheId}")
    public ResponseEntity<CommentaireDTO> ajouterCommentaireTache(
            @PathVariable Integer tacheId,
            @RequestBody CommentaireRequestDTO dto,
            @AuthenticationPrincipal Utilisateur auteur) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentaireService.ajouterCommentaireTache(tacheId, dto, auteur));
    }
    @PostMapping("/projet/{projetId}")
    public ResponseEntity<CommentaireDTO> ajouterCommentaireProjet(
            @PathVariable Integer projetId,
            @RequestBody CommentaireRequestDTO dto,
            @AuthenticationPrincipal Utilisateur auteur) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentaireService.ajouterCommentaireProjet(projetId, dto, auteur));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CommentaireDTO> modifierCommentaire(
            @PathVariable Integer id,
            @RequestBody CommentaireRequestDTO dto,
            @AuthenticationPrincipal Utilisateur auteur
    ) {
        return ResponseEntity.ok(commentaireService.modifierCommentaire(id, dto.getContenu(),dto.getMentionIds() ,auteur));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCommentaire(@PathVariable Integer id, @AuthenticationPrincipal Utilisateur auteur) {
        commentaireService.supprimerCommentaire(id, auteur);
        return ResponseEntity.noContent().build(); // 204, plus idiomatique qu'un 200 vide
    }
}