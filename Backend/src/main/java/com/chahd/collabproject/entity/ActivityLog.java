package com.chahd.collabproject.entity;

import com.chahd.collabproject.Enum.ActivityType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class ActivityLog {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Enumerated(EnumType.STRING)
    private ActivityType type;

    @ManyToOne
    @JoinColumn(name = "acteur_id")
    private Utilisateur acteur; // qui a fait l'action

    @ManyToOne
    @JoinColumn(name = "tache_id")
    private Tache tache; // tâche concernée (nullable si AJOUT_MEMBRE/DESAFFECTER_MEMBRE concerne un projet, pas une tâche précise)

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "membre_concerne_id")
    private Utilisateur membreConcerne; // utilisé pour AJOUT_MEMBRE / DESAFFECTER_MEMBRE

    private String ancienneValeur; // ex: statut avant modif
    private String nouvelleValeur; // ex: statut après modif

    private LocalDateTime dateEvenement;
}
