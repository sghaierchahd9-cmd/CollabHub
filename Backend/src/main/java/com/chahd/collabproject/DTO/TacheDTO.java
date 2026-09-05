package com.chahd.collabproject.DTO;

import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.entity.Tache;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
public class TacheDTO {
    private Integer id;
    private String titre;
    private String description;
    private String priorite;
    private LocalDate dateDebut;
    private LocalDate echeance;
    private String statut;
    private Double tauxAvancement;
    private Integer projetId;
    private String projetNom;
    private OffsetDateTime dateCreation;
    private List<UtilisateurDTO> collaborateurs;

    public static TacheDTO fromTache(Tache t) {
        TacheDTO dto = new TacheDTO();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDescription(t.getDescription());
        dto.setPriorite(t.getPriorite());
        dto.setDateDebut(t.getDateDebut());
        dto.setEcheance(t.getEcheance());
        dto.setStatut(t.getStatut());
        dto.setTauxAvancement(t.getTauxAvancement());
        dto.setProjetId(t.getProjet().getId());
        dto.setProjetNom(t.getProjet().getNom());
        dto.setDateCreation(t.getDateCreation());
        dto.setCollaborateurs(
                t.getCollaborateurs().stream()
                        .map(UtilisateurDTO::fromUtilisateur)
                        .toList()
        );
        return dto;
    }
}
