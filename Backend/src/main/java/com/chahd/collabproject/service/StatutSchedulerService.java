package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.StatutUpdateMessage;
import com.chahd.collabproject.Enum.StatutCollab;
import com.chahd.collabproject.WebSocket.WebSocketEventListener;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class StatutSchedulerService {

    private final UtilisateurRepository utilisateurRepository;
    private final WebSocketEventListener webSocketEventListener;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedRate = 60000)
    public void verifierStatutsExpires() {
        OffsetDateTime maintenant = OffsetDateTime.now();
        List<Utilisateur> expires = utilisateurRepository
                .findByStatutActiviteInAndFinStatutPrevueBefore(
                        List.of(StatutCollab.EN_REUNION, StatutCollab.EN_PAUSE), maintenant);

        for (Utilisateur u : expires) {
            boolean connecte = webSocketEventListener.estConnecte(u.getId());
            u.setStatutActivite(connecte ? StatutCollab.DISPONIBLE : StatutCollab.HORS_LIGNE);
            u.setFinStatutPrevue(null);
            utilisateurRepository.save(u);

            messagingTemplate.convertAndSend(
                    "/topic/utilisateurs/" + u.getId() + "/statut",
                    new StatutUpdateMessage(u.getId(), u.getStatutActivite(), u.getFinStatutPrevue())
            );
        }
    }
}