package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.Piecejointe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PieceJointeRepository extends JpaRepository<Piecejointe, Integer> {
    List<Piecejointe> findByTacheIdAndDateSuppressionIsNull(Integer tacheId);
}
