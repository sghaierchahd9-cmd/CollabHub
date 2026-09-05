package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.MembrePole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembrePoleRepository extends JpaRepository<MembrePole, Integer> {
    List<MembrePole> findByUtilisateurIdAndDateSuppressionIsNull(Integer utilisateurId);
    List<MembrePole> findByEquipeIdAndDateSuppressionIsNull(Integer equipeId);
    Optional<MembrePole> findByUtilisateurIdAndEquipeIdAndDateSuppressionIsNull(Integer utilisateurId, Integer equipeId);
}