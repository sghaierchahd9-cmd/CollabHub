package com.chahd.collabproject.security;

import com.chahd.collabproject.entity.Utilisateur;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;

//	Fabriquer et vérifier les tokens
@Service
public class JwtService {

  //@Value va chercher la valeur dans application.properties
    @Value("${jwt.secret}")
    private String secretkey ;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private SecretKey getSigningSecretKey() {
        return Keys.hmacShaKeyFor(secretkey.getBytes(StandardCharsets.UTF_8));

    }
    public String generateToken(Utilisateur user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("id",user.getId())
                .claim("role",user.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expirationTime))
                .signWith(getSigningSecretKey())
                .compact();
    }
    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public String extractEmail(String token) {
        return extractClaims(token).getSubject() ;
    }
    public int extractUserId(String token) {
        return extractClaims(token).get("id", Integer.class);
    }
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }
    //extractClaims va essayer de décoder
    // et vérifier la signature du token. Si le token est faux,
    // expiré ou corrompu, ça lève une exception (JwtException)
    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }



}
