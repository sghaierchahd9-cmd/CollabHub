package com.chahd.collabproject.repository;

import com.chahd.collabproject.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByTokenHashAndDateUtilisationIsNull(String tokenHash);

    void deleteByDateExpirationBefore(LocalDateTime date);
}