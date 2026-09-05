package com.chahd.collabproject.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.*;

@Getter
@Setter
@Entity
@Table(name = "commentaire")
public class Commentaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "contenu", length = Integer.MAX_VALUE)
    private String contenu;

    @Column(name = "date_creation")
    private OffsetDateTime dateCreation;
    @PrePersist
    protected void onCreate() {
        this.dateCreation = OffsetDateTime.now();
    }

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Utilisateur user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commentaire_parent_id")
    private Commentaire parent;

    @OneToMany(mappedBy = "parent")
    private List<Commentaire> reponses = new ArrayList<>();
    @Column(name = "date_suppression")
    private OffsetDateTime dateSuppression;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tache_id", nullable = true)
    private Tache tache;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;

    @Transient
    public boolean isCommentaireDeProjet() {
        return tache == null;
    }
    @ManyToMany
    @JoinTable(
            name = "commentaire_mention",
            joinColumns = @JoinColumn(name = "commentaire_id"),
            inverseJoinColumns = @JoinColumn(name = "utilisateur_id")
    )
    private Set<Utilisateur> mentions = new HashSet<>();
    @Transient
    public boolean isSupprime() {
        return dateSuppression != null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Commentaire)) return false;
        return id != null && id.equals(((Commentaire) o).id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}