package com.chahd.collabproject.DTO;

import com.chahd.collabproject.entity.Commentaire;
import com.chahd.collabproject.entity.Utilisateur;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@Getter @Setter
public class CommentaireDTO {
    private Integer id;
    private String contenu;
    private UtilisateurDTO auteur;
    private OffsetDateTime dateCreation;
    private OffsetDateTime dateSuppression;
    private Integer parentId;                 // ← nouveau : indispensable pour insérer une réponse au bon endroit
    private List<Integer> mentionIds;
    private List<CommentaireDTO> reponses;

    public static CommentaireDTO fromCommentaire(Commentaire c) {
        CommentaireDTO dto = new CommentaireDTO();
        dto.setId(c.getId());
        dto.setContenu(c.getContenu());
        dto.setAuteur(UtilisateurDTO.fromUtilisateurLight(c.getUser()));
        dto.setDateCreation(c.getDateCreation());
        dto.setDateSuppression(c.getDateSuppression());
        dto.setParentId(c.getParent() != null ? c.getParent().getId() : null);
        dto.setMentionIds(c.getMentions().stream().map(Utilisateur::getId).toList());
        dto.setReponses(
                c.getReponses().stream()
                        .filter(r -> r.getDateSuppression() == null)
                        .sorted(Comparator.comparing(Commentaire::getDateCreation))
                        .map(CommentaireDTO::fromCommentaire)
                        .toList()
        );
        return dto;
    }
}