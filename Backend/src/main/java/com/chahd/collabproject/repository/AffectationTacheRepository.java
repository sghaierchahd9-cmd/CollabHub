package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.AffectationTache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AffectationTacheRepository extends JpaRepository<AffectationTache,Integer> {
    public Optional<AffectationTache> findByTacheIdAndCollaborateurIdAndDateSuppressionIsNull(Integer tacheId, Integer collaborateurId);
    public List<AffectationTache> findByTacheIdAndDateSuppressionIsNull(Integer tacheId);
    public List<AffectationTache> findByCollaborateurIdAndDateSuppressionIsNull(Integer collaborateurId);
}
