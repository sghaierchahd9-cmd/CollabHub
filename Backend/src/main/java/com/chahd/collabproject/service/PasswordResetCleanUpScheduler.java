package com.chahd.collabproject.service;

import com.chahd.collabproject.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class PasswordResetCleanUpScheduler {
    private final PasswordResetTokenRepository tokenRepository;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void nettoyerTokensExpires() {
        tokenRepository.deleteByDateExpirationBefore(LocalDateTime.now());
    }
}
