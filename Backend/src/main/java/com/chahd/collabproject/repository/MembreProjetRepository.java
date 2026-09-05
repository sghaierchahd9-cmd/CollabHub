package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.MembreProjet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembreProjetRepository extends JpaRepository<MembreProjet, Integer> {
    List<MembreProjet> findByProjetIdAndDateSuppressionIsNull(Integer projetId);
    List<MembreProjet> findByUtilisateurIdAndDateSuppressionIsNull(Integer utilisateurId);
    Optional<MembreProjet> findByProjetIdAndUtilisateurIdAndDateSuppressionIsNull(Integer projetId, Integer utilisateurId);
    int countByUtilisateurId(Integer utilisateurId);
}
