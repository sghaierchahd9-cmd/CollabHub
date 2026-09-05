package com.chahd.collabproject.service;

import com.chahd.collabproject.entity.PasswordResetToken;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.PasswordResetTokenRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UtilisateurRepository utilisateurRepository;

    public EmailService(JavaMailSender mailSender, PasswordResetTokenRepository passwordResetTokenRepository, UtilisateurRepository utilisateurRepository) {
        this.mailSender = mailSender;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public void sendEmail(Utilisateur user, String password) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("Votre compte CollabHub a été créé");
            helper.setText(construireCorpsMail(user, password), true);
            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("Échec de l'envoi de l'email de création de compte", e);
        }
    }
    private String construireCorpsMail(Utilisateur utilisateur, String motDePasse) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px;">
              <h2>Bienvenue sur CollabHub, %s !</h2>
              <p>Un compte vient d'être créé pour vous par votre administrateur.</p>
              <p><strong>Email :</strong> %s</p>
              <p><strong>Mot de passe temporaire :</strong> %s</p>
              <p>Merci de vous connecter et de le modifier dès votre première connexion.</p>
            </div>
            """.formatted(utilisateur.getPrenom(), utilisateur.getEmail(), motDePasse);
    }
    public void envoyerEmailResetMotDePasse(String email, String tokenBrut) {
        String lien = "http://localhost:4200/reset-password?token=" + tokenBrut;

        String corps = """
        Bonjour,

        Une demande de réinitialisation de mot de passe a été effectuée pour ce compte.
        Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe (valable 15 minutes) :

        %s

        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        """.formatted(lien);
      Utilisateur user= utilisateurRepository.findByEmailAndDateSuppressionIsNull(email).orElseThrow(() -> new EntityNotFoundException("Utilisateur n'existe pas"));
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(user.getEmail());
            helper.setSubject("Demande de réinitialisation de mot de passe");
            helper.setText(corps, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException e) {
            throw new RuntimeException("Échec de l'envoi de l'email de création de compte", e);
        }
    }
}

