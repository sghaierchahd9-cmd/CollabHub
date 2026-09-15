package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.ResumeIa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeIaRepository extends JpaRepository<ResumeIa, Integer> {
    Optional<ResumeIa> findByProjetId(Integer projetId);
}
