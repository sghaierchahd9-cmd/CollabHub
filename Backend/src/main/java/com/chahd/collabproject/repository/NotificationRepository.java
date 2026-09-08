package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.Notification;
import com.chahd.collabproject.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserAndDateSuppressionIsNullOrderByDateGenerationDesc(Utilisateur user);
    Optional<Notification> findByIdAndDateSuppressionIsNull(int id);
}
