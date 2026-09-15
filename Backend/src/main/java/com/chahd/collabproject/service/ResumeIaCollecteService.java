package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.EvenementResume;
import com.chahd.collabproject.entity.ActivityLog;
import com.chahd.collabproject.entity.Commentaire;
import com.chahd.collabproject.repository.ActivityLogRepository;
import com.chahd.collabproject.repository.CommentaireRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeIaCollecteService {
    private final ActivityLogRepository  activityLogRepository;
    private final CommentaireRepository commentaireRepository;

    private static final int LIMITE_EVENTS=20 ;

    public List<EvenementResume> collecterEvenements(Integer projetId){
        List<EvenementResume> evenements=new ArrayList<>();
        List<ActivityLog> activityLogs= activityLogRepository.findTop20ByProjetIdOrderByDateEvenementDesc(projetId);
        for (ActivityLog activityLog : activityLogs) {
            evenements.add(new EvenementResume(formaterActivite(activityLog), activityLog.getDateEvenement(),activityLog.getActeur().getNom()+" "+activityLog.getActeur().getPrenom()));
        }
        List<Commentaire> commentaires = commentaireRepository
                .findTop20ByProjetIdAndDateSuppressionIsNullOrderByDateCreationDesc(projetId);

        for (Commentaire c : commentaires) {
            evenements.add(new EvenementResume(
                    "Commentaire" + (c.getTache() != null ? " sur la tâche '" + c.getTache().getTitre() + "'" : "")
                            + " : " + c.getContenu(),
                    c.getDateCreation().toLocalDateTime(),
                    c.getUser().getNom() + " " + c.getUser().getPrenom()));
        }

        return evenements.stream()
                .sorted(Comparator.comparing(EvenementResume::date))
                .toList();


    }
    private String formaterActivite(ActivityLog log) {
        return switch (log.getType()) {
            case CREATION_TACHE -> log.getActeur().getPrenom() + " a créé la tâche"
                    + (log.getTache() != null ? " '" + log.getTache().getTitre() + "'" : "");
            case MODIFICATION_TACHE -> log.getActeur().getPrenom() + " a modifié la tâche"
                    + (log.getTache() != null ? " '" + log.getTache().getTitre() + "'" : "")
                    + " (" + log.getAncienneValeur() + " → " + log.getNouvelleValeur() + ")";
            case AJOUT_MEMBRE -> log.getActeur().getPrenom() + " a ajouté "
                    + (log.getMembreConcerne() != null ? log.getMembreConcerne().getPrenom() : "un membre")
                    + " au projet";
            case DESAFFECTER_MEMBRE -> log.getActeur().getPrenom() + " a retiré "
                    + (log.getMembreConcerne() != null ? log.getMembreConcerne().getPrenom() : "un membre")
                    + " du projet";
        };
    }


}
