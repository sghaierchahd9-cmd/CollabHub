package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet,Integer> {
    List<Projet> findByChefProjet(Utilisateur user);

    @Query("SELECT COUNT(DISTINCT p) FROM Projet p WHERE p.chefProjet = :user ")
    int countProjetsForChef(@Param("user") Utilisateur user);
    @Query("SELECT p FROM Projet p WHERE p.dateFinPrevue = :hier AND p.statut <> 'SUSPENDU' AND p.statut <> 'ARCHIVE'")
    List<Projet> findProjetsEnRetardHier(@Param("hier") LocalDate hier);
    @Query("SELECT p FROM Projet p WHERE p.dateFinPrevue = :demain AND p.statut <> 'SUSPENDU' AND p.statut <> 'ARCHIVE'")
    List<Projet> findEcheancesDemain(@Param("demain") LocalDate demain);
}
