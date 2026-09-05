package com.chahd.collabproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "affectation_tache")
public class AffectationTache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tache_id", nullable = false)
    private Tache tache;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "collab_id", nullable = false)
    private Utilisateur collaborateur;

    @Column(name = "date_suppression")
    private OffsetDateTime dateSuppression;
}
