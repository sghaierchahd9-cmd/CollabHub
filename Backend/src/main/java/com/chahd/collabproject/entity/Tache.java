package com.chahd.collabproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@ToString(exclude = {"affectations"})
@Table(name = "tache")
public class Tache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @NotNull
    @Column(name = "titre", nullable = false, length = Integer.MAX_VALUE)
    private String titre;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @Size(max = 100)
    @NotNull
    @Column(name = "priorite", nullable = false, length = 100)
    private String priorite;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "echeance")
    private LocalDate echeance;

    @Size(max = 100)
    @Column(name = "statut", length = 100)
    private String statut;

    @Column(name = "taux_avancement")
    private Double tauxAvancement;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @NotNull
    @ColumnDefault("now()")
    @Column(name = "date_creation", nullable = false)
    private OffsetDateTime dateCreation;
    @OneToMany(mappedBy = "tache", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AffectationTache> affectations = new ArrayList<>();

    @Transient
    @JsonIgnore
    public List<Utilisateur> getCollaborateurs() {
        return affectations.stream()
                .filter(a -> a.getDateSuppression() == null)
                .map(AffectationTache::getCollaborateur)
                .toList();
    }

    @PrePersist
    protected void onCreate() {
        this.dateCreation = OffsetDateTime.now();
    }

}
