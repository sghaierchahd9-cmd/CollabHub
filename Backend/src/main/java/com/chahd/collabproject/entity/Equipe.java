package com.chahd.collabproject.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Data
@Getter
@Setter
@Table(name="equipe")
@NoArgsConstructor
@ToString
public class Equipe {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private int id;
    @Column(nullable = false)
    private String nom;
    private String description;
    private OffsetDateTime dateSuppression ;
    @Column(nullable = false, updatable = false)
    @ColumnDefault("now()")
    private OffsetDateTime dateCreation;
    @PrePersist
    protected void onCreate() {
        this.dateCreation = OffsetDateTime.now();
    }

    @OneToMany(mappedBy = "equipe", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MembrePole> membresPoles;

    @Transient
    @JsonIgnore
    public List<Utilisateur> getMembres() {
        return membresPoles.stream()
                .filter(mp -> mp.getDateSuppression() == null)
                .map(MembrePole::getUtilisateur)
                .toList();
    }


}
