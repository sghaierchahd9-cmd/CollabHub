package com.chahd.collabproject.DTO;

import com.chahd.collabproject.entity.ActivityLog;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.chahd.collabproject.entity.Utilisateur;


import java.time.LocalDateTime;
@Data
@NoArgsConstructor
public class ActivityLogDTO {
    private String initiales;
    private String texte;
    private String badge;
    private LocalDateTime date;
    public ActivityLogDTO toDTO(ActivityLog log) {
        ActivityLogDTO dto = new ActivityLogDTO();
        Utilisateur acteur = log.getActeur();
        dto.setInitiales(genererInitiales(acteur));
        dto.setDate(log.getDateEvenement());

        switch (log.getType()) {
            case CREATION_TACHE:
                dto.setTexte(log.getActeur().getNom() +" "+ log.getActeur().getPrenom() + " a créé la tâche \"" + log.getTache().getTitre() + "\"");
                dto.setBadge("Tache crée");
                break;
            case MODIFICATION_TACHE:
                dto.setTexte(log.getActeur().getNom() +" "+  log.getActeur().getPrenom() + " a modifié la tâche \"" + log.getTache().getTitre() + "\"");
                dto.setBadge("Tache modifiée");
                break;
            case AJOUT_MEMBRE:
                dto.setTexte(log.getActeur().getNom() +" "+  log.getActeur().getPrenom() + " a ajouté " + log.getMembreConcerne().getNom() + " au projet");
                dto.setBadge("Membre ajouté");
                break;
            case DESAFFECTER_MEMBRE:
                dto.setTexte(log.getActeur().getNom() +" "+  log.getActeur().getPrenom() + " a retiré " + log.getMembreConcerne().getNom() + " du projet");
                dto.setBadge("Membre retiré");
                break;
        }
        return dto;
    }

    private String genererInitiales(Utilisateur u) {
        return ("" + u.getPrenom().charAt(0) + u.getNom().charAt(0)).toUpperCase();
    }
}
