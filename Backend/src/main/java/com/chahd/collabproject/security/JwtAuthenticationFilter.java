package com.chahd.collabproject.security;

import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.UtilisateurRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

//Intercepte chaque requête pour lire le token

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService ;
    private final UtilisateurRepository utilisateurRepository;
    public JwtAuthenticationFilter(JwtService jwtService, UtilisateurRepository utilisateurRepository) {
        this.jwtService = jwtService;
        this.utilisateurRepository = utilisateurRepository;
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException
    {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer "))
        {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);

        if (jwtService.isTokenValid(token))
        {
            String email = jwtService.extractEmail(token);
            Utilisateur user = utilisateurRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // compte supprimé en base depuis l'émission du token
                filterChain.doFilter(request, response);
                return;
            }

            if (user.getDateSuppression() != null) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"code\":\"ACCOUNT_SUSPENDED\",\"message\":\"Ce compte est suspendu\"}");
                return; // on ne continue pas la chaîne : requête arrêtée ici
            }
            if (request.getRequestURI().startsWith("/api/utilisateurs/uploads/profils/")) {
                filterChain.doFilter(request, response);
                return;
            }

            var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole());
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(user, null, List.of(authority));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        filterChain.doFilter(request, response);
    }
}
