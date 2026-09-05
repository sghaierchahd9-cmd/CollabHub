package com.chahd.collabproject.entity;

import com.chahd.collabproject.Enum.ModeTravail;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.chahd.collabproject.Enum.StatutCollab ;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name= "utilisateur")
@Data
@ToString(exclude = {"projets", "taches"})
@NoArgsConstructor
public class Utilisateur implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(nullable = false)
    private String nom;
    @Column(nullable = false)
    private String prenom;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String motDePasse;
    @Column(nullable = false)
    private String role;
    @Enumerated(EnumType.STRING)
    private ModeTravail modeTravail;
    @Enumerated(EnumType.STRING)
    private StatutCollab statutActivite ;
    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MembrePole> membresPoles = new ArrayList<>();
    private String photoProfilUrl;
    @Transient
    @JsonIgnore
    public List<Equipe> getEquipes() {
        return membresPoles.stream()
                .filter(mp -> mp.getDateSuppression() == null)
                .map(MembrePole::getEquipe)
                .toList();
    }
    @OneToMany(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<MembreProjet> membresProjet = new ArrayList<>();

    @Transient
    @JsonIgnore
    public List<Projet> getProjets() {
        return membresProjet.stream()
                .filter(mp -> mp.getDateSuppression() == null)
                .map(MembreProjet::getProjet)
                .toList();
    }


    private OffsetDateTime dateSuppression;
    @Column(nullable = false, updatable = false)
    @ColumnDefault("now()")
    private OffsetDateTime dateCreation;
    @ManyToMany(mappedBy="mentions")
    private List<Commentaire> commentaires ;

    @OneToMany(mappedBy = "collaborateur", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AffectationTache> affectationsTaches = new ArrayList<>();

    @Transient
    @JsonIgnore
    public List<Tache> getTaches() {
        return affectationsTaches.stream()
                .filter(a -> a.getDateSuppression() == null)
                .map(AffectationTache::getTache)
                .toList();
    }


    @PrePersist
    protected void onCreate() {
        this.dateCreation = OffsetDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Utilisateur)) return false;
        Utilisateur that = (Utilisateur) o;
        return (id==that.id);
    }
    private OffsetDateTime finStatutPrevue;
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    @Override
    public String getUsername() {
        return this.email;
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role));
    }
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
 @Override
    public String getPassword() { return this.motDePasse; }


}

