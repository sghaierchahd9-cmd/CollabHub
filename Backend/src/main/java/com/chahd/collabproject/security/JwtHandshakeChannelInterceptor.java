package com.chahd.collabproject.security;

import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.security.JwtService;
import com.chahd.collabproject.repository.UtilisateurRepository;
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

@Component
@RequiredArgsConstructor
public class JwtHandshakeChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
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

        return message;
    }
}
