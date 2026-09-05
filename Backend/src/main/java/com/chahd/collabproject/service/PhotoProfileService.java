package com.chahd.collabproject.service;

import com.chahd.collabproject.Exceptions.FichierTropVolumineuxException;
import com.chahd.collabproject.Exceptions.TypeFichierInvalideException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.chahd.collabproject.service.LocalFileStorageService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
@Service
@Slf4j
public class PhotoProfileService {

    private static final Set<String> TYPES_AUTORISES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long TAILLE_MAX = 2 * 1024 * 1024; // 2 Mo

    private final Path racineProfils;

    public PhotoProfileService(@Value("${app.upload.dir.profils}") String uploadDir) {
        this.racineProfils = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String uploader(MultipartFile fichier, int utilisateurId) throws IOException {
        String contentType = fichier.getContentType();
        String fileName = fichier.getOriginalFilename();

        if (contentType == null || !TYPES_AUTORISES.contains(contentType)) {
            throw new TypeFichierInvalideException("Seules les images JPG, PNG, WEBP sont acceptées");
        }
        if (fichier.getSize() > TAILLE_MAX) {
            throw new FichierTropVolumineuxException("Taille maximale : 2 Mo");
        }

        String extension = extraireExtension(fileName);
        String nomFichier = UUID.randomUUID() + extension;
        Path chemin = racineProfils.resolve(nomFichier);

        Files.createDirectories(chemin.getParent());
        Files.copy(fichier.getInputStream(), chemin, StandardCopyOption.REPLACE_EXISTING);

        return "profils/" + nomFichier;
    }

    private String extraireExtension(String nomFichier) {
        if (nomFichier == null) return "";
        int dernierPoint = nomFichier.lastIndexOf('.');
        if (dernierPoint <= 0) return "";
        return nomFichier.substring(dernierPoint);
    }

    public void supprimerFichierPhysique(String url) {
        try {
            Path chemin = resoudreCheminDepuisUrl(url);
            boolean supprime = Files.deleteIfExists(chemin);
            if (!supprime) {
                log.warn("Fichier déjà absent lors de la suppression : {}", chemin);
            }
        } catch (Exception e) {
            log.warn("Impossible de supprimer l'ancienne photo de profil : {}", url, e);
        }
    }

    private Path resoudreCheminDepuisUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("URL de photo de profil vide");
        }

        String nomFichier = Paths.get(url).getFileName().toString();

        if (!nomFichier.matches("^[0-9a-fA-F-]{36}\\.[a-zA-Z0-9]+$")) {
            throw new IllegalArgumentException("Nom de fichier invalide : " + nomFichier);
        }

        Path chemin = racineProfils.resolve(nomFichier).normalize();

        if (!chemin.startsWith(racineProfils)) {
            throw new SecurityException("Tentative d'accès en dehors du dossier autorisé");
        }

        return chemin;
    }
}