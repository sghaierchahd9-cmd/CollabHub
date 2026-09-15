package com.chahd.collabproject.Controller;

import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.service.ResumeIaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projets/{projetId}/resume-ia")
@RequiredArgsConstructor
public class ResumeIaController {

    private final ResumeIaService resumeIaService;

    @GetMapping
    public ResponseEntity<Map<String, String>> getResume(
            @PathVariable Integer projetId,
            @RequestParam(defaultValue = "false") boolean forcer,
            @AuthenticationPrincipal Utilisateur utilisateur) {

        String contenu = resumeIaService.obtenirResume(projetId, utilisateur, forcer);
        return ResponseEntity.ok(Map.of("contenu", contenu));
    }
}
