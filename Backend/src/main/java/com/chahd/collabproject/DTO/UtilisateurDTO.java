package com.chahd.collabproject.DTO;

import com.chahd.collabproject.Enum.ModeTravail;
import com.chahd.collabproject.Enum.StatutCollab;
import com.chahd.collabproject.entity.Equipe;
import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
@Data
@AllArgsConstructor
public class UtilisateurDTO {
    private int id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    @Enumerated(EnumType.STRING)
    private ModeTravail modeTravail;
    @Enumerated(EnumType.STRING)
    private StatutCollab statutActivite ;
    private OffsetDateTime finStatutPrevue;
    private  List<Integer> equipeIds =new ArrayList<>() ;
    private Integer nbProjets;
    private Integer nbTaches;
    private String photoProfilUrl ;

    private OffsetDateTime dateSuppression;
    private OffsetDateTime dateCreation;
    public UtilisateurDTO() {}
    public static UtilisateurDTO fromUtilisateur(Utilisateur utilisateur) {
        UtilisateurDTO user = new UtilisateurDTO();
        user.id = utilisateur.getId();
        user.nom = utilisateur.getNom();
        user.prenom = utilisateur.getPrenom();
        user.email = utilisateur.getEmail();
        user.role = utilisateur.getRole();
        user.finStatutPrevue=utilisateur.getFinStatutPrevue();

        user.modeTravail = utilisateur.getModeTravail();
       user.statutActivite = utilisateur.getStatutActivite();
       if(utilisateur.getEquipes() != null) {
           for( Equipe equipe : utilisateur.getEquipes()){
               user.equipeIds.add(equipe.getId());
           }
       }
       user.dateSuppression = utilisateur.getDateSuppression();
        user.dateCreation = utilisateur.getDateCreation();
        user.photoProfilUrl = utilisateur.getPhotoProfilUrl();

        return user;
    }
    public static UtilisateurDTO FromUtilisateurAvecStats(Utilisateur utilisateur, int nbProjets, int nbTaches) {
        UtilisateurDTO user = fromUtilisateur(utilisateur); // réutilise la logique existante (DRY)
        user.nbProjets = nbProjets;
        user.nbTaches = nbTaches;
        return user;
    }
    public static UtilisateurDTO fromUtilisateurLight(Utilisateur utilisateur) {
        UtilisateurDTO user = new UtilisateurDTO();
        user.id = utilisateur.getId();
        user.nom = utilisateur.getNom();
        user.prenom = utilisateur.getPrenom();
        user.email = utilisateur.getEmail();
        user.role = utilisateur.getRole();
        user.modeTravail = utilisateur.getModeTravail();
        user.statutActivite = utilisateur.getStatutActivite();
        user.dateSuppression = utilisateur.getDateSuppression();
        user.dateCreation = utilisateur.getDateCreation();
        user.photoProfilUrl = utilisateur.getPhotoProfilUrl();

        return user;

    }


}
