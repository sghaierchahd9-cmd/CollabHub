package com.chahd.collabproject.WebSocket;

import com.chahd.collabproject.DTO.StatutUpdateMessage;
import com.chahd.collabproject.Enum.StatutCollab;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UtilisateurRepository utilisateurRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final Map<Integer, Set<String>> sessionsParUtilisateur = new ConcurrentHashMap<>();

    @EventListener
    public void handleSessionConnected(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) accessor.getUser();
        if (auth == null) return;

        Utilisateur principal = (Utilisateur) auth.getPrincipal();
        Set<String> sessions = sessionsParUtilisateur
                .computeIfAbsent(principal.getId(), k -> ConcurrentHashMap.newKeySet());
        sessions.add(accessor.getSessionId());

        if (sessions.size() == 1) { // première session = vraie reconnexion
            utilisateurRepository.findById(principal.getId())
                    .ifPresent(u -> mettreAJourStatut(u, true));
        }
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Authentication auth = (Authentication) accessor.getUser();
        if (auth == null) return;

        Utilisateur principal = (Utilisateur) auth.getPrincipal();
        Set<String> sessions = sessionsParUtilisateur.get(principal.getId());
        if (sessions == null) return;

        sessions.remove(accessor.getSessionId());
        if (sessions.isEmpty()) {
            sessionsParUtilisateur.remove(principal.getId());
            utilisateurRepository.findById(principal.getId())
                    .ifPresent(u -> mettreAJourStatut(u, false));
        }
    }

    private void mettreAJourStatut(Utilisateur u, boolean estConnecte) {
        StatutCollab statut = u.getStatutActivite();
        OffsetDateTime fin = u.getFinStatutPrevue();
        OffsetDateTime maintenant = OffsetDateTime.now();

        boolean statutTemporaire = statut == StatutCollab.EN_REUNION || statut == StatutCollab.EN_PAUSE;
        boolean periodeEncoreValide = statutTemporaire && fin != null && maintenant.isBefore(fin);

        if (periodeEncoreValide) {
            return; // on garde le même statut, comme demandé
        }

        StatutCollab nouveau = estConnecte ? StatutCollab.DISPONIBLE : StatutCollab.HORS_LIGNE;
        if (nouveau != statut) {
            u.setStatutActivite(nouveau);
            u.setFinStatutPrevue(null);
            utilisateurRepository.save(u);
            diffuserStatut(u);
        }
    }
    private void diffuserStatut(Utilisateur u) {
        messagingTemplate.convertAndSend(
                "/topic/utilisateurs/" + u.getId() + "/statut",
                new StatutUpdateMessage(u.getId(), u.getStatutActivite(), u.getFinStatutPrevue())
        );
    }

    public boolean estConnecte(int utilisateurId) {
        return sessionsParUtilisateur.containsKey(utilisateurId);
    }
}