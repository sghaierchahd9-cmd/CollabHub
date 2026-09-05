package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.PieceJointeDTO;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.service.PieceJointeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pieces-jointes")
@RequiredArgsConstructor
public class PieceJointeController {

    private final PieceJointeService pieceJointeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PieceJointeDTO> upload(
            @RequestParam("tacheId") Integer tacheId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Utilisateur currentUser) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pieceJointeService.upload(tacheId, file, currentUser));
    }

    @GetMapping("/tache/{tacheId}")
    public ResponseEntity<List<PieceJointeDTO>> getByTache(
            @PathVariable Integer tacheId,
            @AuthenticationPrincipal Utilisateur currentUser) {
        return ResponseEntity.ok(pieceJointeService.getByTache(tacheId, currentUser));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(
            @PathVariable Integer id,
            @AuthenticationPrincipal Utilisateur currentUser) throws IOException {
        Resource resource = pieceJointeService.download(id, currentUser);
        String nomFichier = pieceJointeService.getNomFichier(id);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(nomFichier, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource) ;
    }

    @PutMapping("/{id}")
    public ResponseEntity<PieceJointeDTO> renommer(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Utilisateur currentUser) {
        return ResponseEntity.ok(pieceJointeService.renommer(id, body.get("nomFichier"), currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Integer id,
            @AuthenticationPrincipal Utilisateur currentUser) {
        pieceJointeService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}