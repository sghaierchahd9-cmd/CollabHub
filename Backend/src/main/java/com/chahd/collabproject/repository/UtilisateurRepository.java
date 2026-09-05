package com.chahd.collabproject.repository;

import com.chahd.collabproject.Enum.StatutCollab;
import com.chahd.collabproject.entity.Equipe;
import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface UtilisateurRepository extends JpaRepository<Utilisateur,Integer> {

    Optional<Utilisateur> findByEmail(String email);
    // Ne renvoyer que les utilisateurs actifs (soft delete)
    @Query("SELECT u FROM Utilisateur u WHERE u.dateSuppression IS NULL")
    List<Utilisateur> findAllActifs();
   @Query("SELECT u from Utilisateur u where u.role = :role")
    List<Utilisateur> findByRole(String role);
   @Query("SELECT u from Utilisateur u join u.affectationsTaches t where t.tache = :tache and t.dateSuppression Is Null")
    List<Utilisateur> findByTache(@Param("tache") Tache tache);
    // ProjetRepository
    List<Utilisateur> findByStatutActiviteInAndFinStatutPrevueBefore(
            List<StatutCollab> statuts, OffsetDateTime maintenant);
    // UtilisateurRepository
    @Query("SELECT u FROM Utilisateur u LEFT JOIN FETCH u.membresPoles mp LEFT JOIN FETCH mp.equipe WHERE u.id = :id")
    Optional<Utilisateur> findByIdWithMembresPoles(@Param("id") Integer id);
    boolean existsByEmail(String email);
   List<Utilisateur> findByRoleAndDateSuppressionIsNull(String role);
    Optional<Utilisateur> findByEmailAndDateSuppressionIsNull(String email);

}
