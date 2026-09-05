package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentaireRepository extends JpaRepository<Commentaire,Integer> {
    List<Commentaire> findByTacheIdAndParentIsNullAndDateSuppressionIsNullOrderByDateCreationAsc(Integer tacheId);
    List<Commentaire> findByProjetIdAndTacheIdIsNullAndDateSuppressionIsNull(Integer projetId);

}
