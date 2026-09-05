package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TacheRepository extends JpaRepository<Tache,Integer> {
    public List<Tache> findTacheByProjet(Projet projet);
    @Query("select  t from Tache t join t.affectations a where a.collaborateur= :user and a.dateSuppression is null")
    public List<Tache> findTacheByUser(@Param("user") Utilisateur user);

    @Query("SELECT COUNT(t) FROM Tache t join t.affectations a WHERE a.collaborateur= :user and a.dateSuppression is null")
    int countTachesForUser(@Param("user") Utilisateur user);
    @Query("""
    select distinct t from Tache t
    join t.affectations a
    where t.projet.id = :projetId
      and a.collaborateur.id = :membreId
      and a.dateSuppression is null
    """)
    List<Tache> findByProjetIdAndCollaborateurActif(@Param("projetId") int projetId,
                                                    @Param("membreId") int membreId);
    @Query("SELECT  distinct t FROM Tache t join t.affectations a WHERE a.collaborateur= :user and a.dateSuppression is null order by t.dateCreation desc ")
    List<Tache> TachesForUser(@Param("user") Utilisateur user);
    // Rappel : tâches dont l'échéance est exactement demain
    @Query("SELECT t FROM Tache t WHERE t.echeance = :demain AND t.statut <> 'TERMINEE'")
    List<Tache> findEcheancesDemain(@Param("demain") LocalDate demain);

    // Retard : tâches dont l'échéance était exactement hier
    @Query("SELECT t FROM Tache t WHERE t.echeance = :hier AND t.statut <> 'TERMINEE'")
    List<Tache> findTachesEnRetardHier(@Param("hier") LocalDate hier);
}
