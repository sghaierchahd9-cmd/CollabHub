package com.chahd.collabproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@Table(name = "resume_ia")
public class ResumeIa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(length = Integer.MAX_VALUE, nullable = false)
    private String contenu;

    @Column(nullable = false)
    private OffsetDateTime dateGeneration;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false, unique = true)
    private Projet projet;
}
