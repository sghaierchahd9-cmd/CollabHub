package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.Equipe;
import com.chahd.collabproject.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface EquipeRepository extends JpaRepository<Equipe, Integer> {



    List<Equipe> findAllByDateSuppressionIsNull();
}
