package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Integer> {
    List<ActivityLog> findTop5ByProjetIdOrderByDateEvenementDesc(int projetId);
}
