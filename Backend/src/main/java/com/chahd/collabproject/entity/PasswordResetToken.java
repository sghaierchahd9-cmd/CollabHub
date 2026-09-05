package com.chahd.collabproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token")
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_expiration", nullable = false)
    private LocalDateTime dateExpiration;

    @Column(name = "date_utilisation")
    private LocalDateTime dateUtilisation; // null = pas encore utilisé

    public PasswordResetToken(Utilisateur utilisateur, String tokenHash, LocalDateTime dateExpiration) {
        this.utilisateur = utilisateur;
        this.tokenHash = tokenHash;
        this.dateCreation = LocalDateTime.now();
        this.dateExpiration = dateExpiration;
    }
}