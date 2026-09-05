package com.chahd.collabproject.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {
    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public String store(MultipartFile file, String subDir) throws IOException {
        // un sous-dossier par tache
        Path targetDir = Paths.get(uploadDir, subDir);
        Files.createDirectories(targetDir);


        String storedFileName = UUID.randomUUID() + "_" + StringUtils.cleanPath(file.getOriginalFilename());
        Path targetPath = targetDir.resolve(storedFileName);
        file.transferTo(targetPath);

        // on stocke le chemin RELATIF en BDD
        return subDir + "/" + storedFileName;
    }
    @Override
    public Resource loadAsResource(String relativePath) throws IOException {
        Path filePath = Paths.get(uploadDir, relativePath).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new EntityNotFoundException("Fichier introuvable sur le disque: " + relativePath);
        }
        return resource;
    }

    @Override
    public void delete(String relativePath) {
        try {
            Files.deleteIfExists(Paths.get(uploadDir, relativePath).normalize());
        } catch (IOException e) {
            // on ne bloque jamais la suppression logique en BDD
            System.err.println("Impossible de supprimer le fichier physique: " + relativePath);
        }
}

}
