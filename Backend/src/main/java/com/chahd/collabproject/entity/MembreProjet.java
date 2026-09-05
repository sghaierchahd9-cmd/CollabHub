package com.chahd.collabproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "membre_projet")
public class MembreProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "membre_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date_suppression")
    private OffsetDateTime dateSuppression;
}
