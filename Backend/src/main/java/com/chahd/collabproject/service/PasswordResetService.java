package com.chahd.collabproject.service;

import com.chahd.collabproject.Exceptions.TokenInvalideException;
import com.chahd.collabproject.entity.PasswordResetToken;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.PasswordResetTokenRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final TokenGenerator tokenGenerator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final int EXPIRATION_MINUTES = 15;

    @Transactional
    public void demanderReset(String email) {
        Optional<Utilisateur> utilisateurOpt =
                utilisateurRepository.findByEmailAndDateSuppressionIsNull(email);

        // Réponse identique que l'email existe ou non : évite l'énumération de comptes
        if (utilisateurOpt.isEmpty()) {
            return;
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        String tokenBrut = tokenGenerator.genererTokenReset();
        String tokenHash = tokenGenerator.hasherToken(tokenBrut);
        LocalDateTime expiration = LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES);

        PasswordResetToken token = new PasswordResetToken(utilisateur, tokenHash, expiration);
        tokenRepository.save(token);

        emailService.envoyerEmailResetMotDePasse(utilisateur.getEmail(), tokenBrut);
    }

    @Transactional
    public void reinitialiserMotDePasse(String tokenBrut, String nouveauMotDePasse) {
        String tokenHash = tokenGenerator.hasherToken(tokenBrut);

        PasswordResetToken token = tokenRepository
                .findByTokenHashAndDateUtilisationIsNull(tokenHash)
                .orElseThrow(() -> new TokenInvalideException("Lien invalide ou déjà utilisé"));

        if (token.getDateExpiration().isBefore(LocalDateTime.now())) {
            throw new TokenInvalideException("Ce lien a expiré, veuillez refaire une demande");
        }

        Utilisateur utilisateur = token.getUtilisateur();
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        utilisateurRepository.save(utilisateur);

        token.setDateUtilisation(LocalDateTime.now());
        tokenRepository.save(token);
    }
}
