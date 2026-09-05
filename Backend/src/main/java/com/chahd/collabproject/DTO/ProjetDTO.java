package com.chahd.collabproject.DTO;

import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Utilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
public class ProjetDTO {
    private Integer id;
    private String nom;
    private String description;
    private String objectifs;
    private LocalDate dateDebut;
    private LocalDate dateFinPrevue;
    private String niveauPriorite ;
    private String statut;
    private Integer chefProjet;
    private OffsetDateTime dateCreation;
    private List<Integer> collaborateurIds=new ArrayList<>() ;

    public ProjetDTO() {
    }

    public static ProjetDTO fromentity(Projet entity) {
        ProjetDTO projet =new ProjetDTO();
        projet.setId(entity.getId());
        projet.setNom(entity.getNom());
        projet.setDescription(entity.getDescription());
        projet.setObjectifs(entity.getObjectifs());
        projet.setDateDebut(entity.getDateDebut());
        projet.setDateFinPrevue(entity.getDateFinPrevue());
        projet.setNiveauPriorite(entity.getNiveauPriorite());
        projet.setStatut(entity.getStatut());
        projet.setChefProjet(UtilisateurDTO.fromUtilisateur(entity.getChefProjet()).getId());
        projet.setDateCreation(entity.getDateCreation());
        if(entity.getCollaborateurs() != null) {
            for (Utilisateur collab : entity.getCollaborateurs()) {
                projet.getCollaborateurIds().add(collab.getId());
            }
        }

        return projet;
    }

}
