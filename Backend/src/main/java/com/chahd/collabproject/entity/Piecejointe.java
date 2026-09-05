package com.chahd.collabproject.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;

@Getter
@Setter
@Entity
@Table(name = "piecejointe")
public class Piecejointe  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Size(max = 200)
    @NotNull
    @Column(name = "nom_fichier", nullable = false, length = 200)
    private String nomFichier;

    @Size(max = 200)
    @NotNull
    @Column(name = "url_stockage", nullable = false, length = 200)
    private String urlStockage;

    @Column(name = "date_upload")
    private OffsetDateTime dateUpload;
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tache_id", nullable = false)
    private Tache tache;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;
    private OffsetDateTime dateSuppression;

}