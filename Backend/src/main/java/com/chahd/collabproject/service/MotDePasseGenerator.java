package com.chahd.collabproject.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class MotDePasseGenerator {

    private static final String CARACTERES =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    private static final int LONGUEUR = 12;
    private final SecureRandom random = new SecureRandom();

    public String genererMotDePasseTemporaire() {
        StringBuilder sb = new StringBuilder(LONGUEUR);
        for (int i = 0; i < LONGUEUR; i++) {
            sb.append(CARACTERES.charAt(random.nextInt(CARACTERES.length())));
        }
        return sb.toString();
    }
}