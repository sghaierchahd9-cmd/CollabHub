package com.chahd.collabproject.service;

import com.chahd.collabproject.DTO.PieceJointeDTO;
import com.chahd.collabproject.Enum.TypeNotification;
import com.chahd.collabproject.entity.*;
import com.chahd.collabproject.repository.PieceJointeRepository;
import com.chahd.collabproject.repository.TacheRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PieceJointeService {

    private final PieceJointeRepository pieceJointeRepository;
    private final TacheRepository tacheRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Transactional
    public PieceJointeDTO upload(Integer tacheId, MultipartFile file, Utilisateur currentUser) throws IOException {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new EntityNotFoundException("Tache introuvable"));

        verifierAccesUpload(tache, currentUser);

        String relativePath = fileStorageService.store(file, "projet-"+ tache.getProjet().getId()+"/tache-" + tacheId);

        Piecejointe pj = new Piecejointe();
        pj.setNomFichier(file.getOriginalFilename());
        pj.setUrlStockage(relativePath);
        pj.setDateUpload(OffsetDateTime.now());
        pj.setTache(tache);
        pj.setUser(currentUser);


        pieceJointeRepository.save(pj);
        if(!tache.getProjet().getChefProjet().equals(currentUser)){
        notificationService.notifierAttacherPieceJointe(tache.getProjet().getChefProjet(),tache.getTitre(),currentUser.getNom()+" "+currentUser.getPrenom(),tache.getProjet().getNom());}

        return PieceJointeDTO.fromPiecejointe(pj);
    }

    @Transactional(readOnly = true)
    public List<PieceJointeDTO> getByTache(Integer tacheId, Utilisateur currentUser) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new EntityNotFoundException("Tache introuvable"));

        verifierAccesLecture(tache, currentUser);

        return pieceJointeRepository.findByTacheIdAndDateSuppressionIsNull(tacheId)
                .stream()
                .map(PieceJointeDTO::fromPiecejointe)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource download(Integer id, Utilisateur currentUser) throws IOException {
        Piecejointe pj = getActiveOrThrow(id);
        verifierAccesLecture(pj.getTache(), currentUser);
        return fileStorageService.loadAsResource(pj.getUrlStockage());
    }

    @Transactional(readOnly = true)
    public String getNomFichier(Integer id) {
        return getActiveOrThrow(id).getNomFichier();
    }

    @Transactional
    public void delete(Integer id, Utilisateur currentUser) {
        Piecejointe pj = getActiveOrThrow(id);
        verifierAccesSuppression(pj, currentUser);

        // soft delete uniquement, coherent avec le reste de l'app : le fichier physique reste sur disque
        pj.setDateSuppression(OffsetDateTime.now());
        pieceJointeRepository.save(pj);
        // Suppression physique best-effort
        fileStorageService.delete(pj.getUrlStockage());
        if(!pj.getTache().getProjet().getChefProjet().equals(currentUser)){
        notificationService.notifierSupprimerPieceJointe(pj.getTache().getProjet().getChefProjet(),pj.getTache().getTitre(),pj.getNomFichier(),currentUser.getNom()+" "+currentUser.getPrenom(),pj.getTache().getProjet().getNom());}

    }

    private String extraireExtension(String nomFichier) {
        if (nomFichier == null) {
            return "";
        }
        int dernierPoint = nomFichier.lastIndexOf('.');
        if (dernierPoint <= 0) {
            return "";
        }
        return nomFichier.substring(dernierPoint); // inclut le "."
    }

    public PieceJointeDTO renommer(Integer id, String nouveauNom, Utilisateur currentUser) {
        Piecejointe pj = getActiveOrThrow(id);
        verifierAccesSuppression(pj, currentUser);

        if (nouveauNom == null || nouveauNom.isBlank()) {
            throw new IllegalArgumentException("Le nom du fichier ne peut pas etre vide.");
        }

        String extensionOriginale = extraireExtension(pj.getNomFichier());

        String nomRecu = nouveauNom.trim();
        String extensionRecue = extraireExtension(nomRecu);
        String nomBase = extensionRecue.isEmpty()
                ? nomRecu
                : nomRecu.substring(0, nomRecu.length() - extensionRecue.length());
        nomBase = nomBase.trim();

        if (nomBase.isEmpty()) {
            throw new IllegalArgumentException("Le nom du fichier ne peut pas etre vide.");
        }

        pj.setNomFichier(nomBase + extensionOriginale);
        pieceJointeRepository.save(pj);
        return PieceJointeDTO.fromPiecejointe(pj);
    }

    private Piecejointe getActiveOrThrow(Integer id) {
        Piecejointe pj = pieceJointeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Piece jointe introuvable"));
        if (pj.getDateSuppression() != null) {
            throw new EntityNotFoundException("Piece jointe introuvable");
        }
        return pj;
    }

    // --- Regles d'acces ---

    private void verifierAccesUpload(Tache tache, Utilisateur user) {
        if (estAdmin(user) || estChefDuProjet(user, tache.getProjet())) return;
        boolean estAffecte = tache.getCollaborateurs().stream()
                .anyMatch(c -> c.getId()==user.getId());
        if (!estAffecte) {
            throw new AccessDeniedException("Tu n'es pas affecte a cette tache");
        }
    }

    private void verifierAccesLecture(Tache tache, Utilisateur user) {
        if (estAdmin(user) || estChefDuProjet(user, tache.getProjet())) return;
        boolean estAffecte = tache.getCollaborateurs().stream()
                .anyMatch(c -> c.getId()==user.getId());
        if (!estAffecte) {
            throw new AccessDeniedException("Acces refuse a cette tache");
        }
    }

    private void verifierAccesSuppression(Piecejointe pj, Utilisateur user) {
        boolean estUploadeur = pj.getUser().getId()==user.getId();
        if (estUploadeur || estAdmin(user) || estChefDuProjet(user, pj.getTache().getProjet())) return;
        throw new AccessDeniedException("Tu ne peux pas modifier/supprimer cette piece jointe");
    }

    private boolean estAdmin(Utilisateur user) {
        return "ADMINISTRATEUR".equals(user.getRole());
    }

    private boolean estChefDuProjet(Utilisateur user, Projet projet) {

        return "CHEF_PROJET".equals(user.getRole())
                && projet.getChefProjet() != null
                && projet.getChefProjet().getId()==user.getId();
    }

}