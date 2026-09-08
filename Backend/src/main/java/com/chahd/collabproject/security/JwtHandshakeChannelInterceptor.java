package com.chahd.collabproject.security;

import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.TacheRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import com.chahd.collabproject.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class JwtHandshakeChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;
    private final TacheRepository tacheRepository;
    private final ProjetRepository projetRepository;
    private final UtilisateurService utilisateurService;

    private static final Pattern TACHE_COMMENTAIRES = Pattern.compile("^/topic/taches/(\\d+)/commentaires$");
    private static final Pattern PROJET_COMMENTAIRES = Pattern.compile("^/topic/projets/(\\d+)/commentaires$");
    private static final Pattern STATUT_UTILISATEUR = Pattern.compile("^/topic/utilisateurs/(\\d+)/statut$");

    @Override
    @Transactional(readOnly = true) // nécessaire : getCollaborateurs()/getProjets() accèdent à des collections lazy
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Token JWT manquant dans la frame CONNECT");
            }
            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                throw new IllegalArgumentException("Token JWT invalide ou expiré");
            }
            String email = jwtService.extractEmail(token);
            Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
            if (utilisateur.getDateSuppression() != null) {
                throw new IllegalArgumentException("Compte suspendu");
            }
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    utilisateur, null, utilisateur.getAuthorities()
            );
            accessor.setUser(authentication);
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            Authentication auth = (Authentication) accessor.getUser();
            if (auth == null) {
                throw new IllegalArgumentException("Abonnement refusé : utilisateur non authentifié");
            }
            Utilisateur utilisateur = (Utilisateur) auth.getPrincipal();
            verifierAccesSouscription(utilisateur, accessor.getDestination());
        }

        return message;
    }

    private void verifierAccesSouscription(Utilisateur utilisateur, String destination) {
        if (destination == null) return;

        Matcher mTache = TACHE_COMMENTAIRES.matcher(destination);
        if (mTache.matches()) {
            Tache tache = tacheRepository.findById(Integer.parseInt(mTache.group(1)))
                    .orElseThrow(() -> new IllegalArgumentException("Tâche introuvable"));
            if (!peutAccederTache(utilisateur, tache)) {
                throw new IllegalArgumentException("Abonnement refusé : accès à cette tâche non autorisé");
            }
            return;
        }

        Matcher mProjet = PROJET_COMMENTAIRES.matcher(destination);
        if (mProjet.matches()) {
            Projet projet = projetRepository.findById(Integer.parseInt(mProjet.group(1)))
                    .orElseThrow(() -> new IllegalArgumentException("Projet introuvable"));
            if (!peutAccederProjet(utilisateur, projet)) {
                throw new IllegalArgumentException("Abonnement refusé : accès à ce projet non autorisé");
            }
            return;
        }

        Matcher mStatut = STATUT_UTILISATEUR.matcher(destination);
        if (mStatut.matches()) {
            int cibleId = Integer.parseInt(mStatut.group(1));
            Utilisateur cible = utilisateurRepository.findById(cibleId)
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
            if (!utilisateurService.estVisiblePour(utilisateur, cible)) {
                throw new IllegalArgumentException("Abonnement refusé : accès au statut de cet utilisateur non autorisé");
            }
        }
        // les autres destinations (ex: /user/queue/notifications) sont déjà scopées
        // par utilisateur via convertAndSendToUser côté serveur — rien à vérifier ici
    }

    private boolean peutAccederTache(Utilisateur utilisateur, Tache tache) {
        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || ("CHEF_PROJET".equals(utilisateur.getRole())
                && tache.getProjet().getChefProjet().getId() == utilisateur.getId());
        boolean estAffecte = tache.getCollaborateurs().stream()
                .anyMatch(c -> c.getId() == utilisateur.getId());
        return estAdminOuChef || estAffecte;
    }

    private boolean peutAccederProjet(Utilisateur utilisateur, Projet projet) {
        boolean estAdminOuChef = "ADMINISTRATEUR".equals(utilisateur.getRole())
                || ("CHEF_PROJET".equals(utilisateur.getRole())
                && projet.getChefProjet().getId() == utilisateur.getId());
        boolean estMembre = projet.getCollaborateurs().stream()
                .anyMatch(c -> c.getId() == utilisateur.getId());
        return estAdminOuChef || estMembre;
    }
}
