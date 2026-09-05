package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.LoginRequest;
import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.UtilisateurRepository;
import com.chahd.collabproject.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public AuthController(UtilisateurRepository utilisateurRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Utilisateur user = utilisateurRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getMotDePasse(), user.getMotDePasse())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Email ou mot de passe incorrect"));
        }
        else if (user.getDateSuppression()!=null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "ce compte est suspendu"));
        }

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", UtilisateurDTO.fromUtilisateur(user)
        ));
    }
}
