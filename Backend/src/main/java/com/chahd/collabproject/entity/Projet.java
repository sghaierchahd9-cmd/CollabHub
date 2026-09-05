package com.chahd.collabproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@Getter
@Setter
@Table(name="projet")
@NoArgsConstructor
public class Projet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(nullable = false)
    private String nom;
    private String description;
    private String objectifs;
    private LocalDate dateDebut;
    private LocalDate dateFinPrevue;
    private String niveauPriorite ;
    private String statut;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chef_id", nullable = false)

    private Utilisateur chefProjet;
    @Column(nullable = false, updatable = false)
    @ColumnDefault("now()")
    private OffsetDateTime dateCreation;

    @JsonIgnore
    private List<Utilisateur> collaborateurs = new ArrayList<>();
    @PrePersist
    protected void onCreate() {
        this.dateCreation = OffsetDateTime.now();
    }
    @OneToMany(mappedBy = "projet", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MembreProjet> membresProjets = new ArrayList<>();

    @Transient
    @JsonIgnore
    public List<Utilisateur> getCollaborateurs() {
        return membresProjets.stream()
                .filter(mp -> mp.getDateSuppression() == null)
                .map(MembreProjet::getUtilisateur)
                .toList();
    }

}
