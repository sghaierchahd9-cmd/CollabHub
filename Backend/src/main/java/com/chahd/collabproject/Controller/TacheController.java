package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.UtilisateurDTO;
import com.chahd.collabproject.entity.Projet;
import com.chahd.collabproject.entity.Tache;
import com.chahd.collabproject.entity.Utilisateur;
import com.chahd.collabproject.repository.ProjetRepository;
import com.chahd.collabproject.repository.TacheRepository;
import com.chahd.collabproject.repository.UtilisateurRepository;
import com.chahd.collabproject.service.TacheService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.chahd.collabproject.DTO.TacheDTO;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

@RestController
@RequestMapping("api/taches")
public class TacheController {
    private final TacheRepository tacheRepository;
    private final TacheService tacheService;
    private final ProjetRepository projetRepository;
   private final UtilisateurRepository utilisateurRepository;
    public TacheController(TacheRepository tacheRepository, TacheService tacheService, ProjetRepository projetRepository, UtilisateurRepository utilisateurRepository) {
        this.tacheRepository = tacheRepository;
        this.tacheService = tacheService;
        this.projetRepository = projetRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
@GetMapping()
    public List<TacheDTO> getTaches(Authentication authentication) {
    Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();
    List<Tache> taches= new ArrayList<>();
    if("ADMINISTRATEUR".equals(utilisateur.getRole())){
        taches= tacheRepository.findAll();
    }
    else{
       taches= this.tacheService.getTaches(utilisateur);
    }
    List<TacheDTO> tacheDTOS = new ArrayList<>();
    for (Tache tache : taches) {
        tacheDTOS.add(TacheDTO.fromTache(tache));
    }
  return tacheDTOS;
}


@GetMapping("/projet/{id}")
    public List<TacheDTO> getTachesProjet( @PathVariable int id) {
        Projet projet=projetRepository.findById(id).get();
    List<Tache> taches = new ArrayList<>();
        if(projet!=null){
             taches =tacheRepository.findTacheByProjet(projet);
        }
        List<TacheDTO> tachesDTO = new ArrayList<>();
        for(Tache tache : taches){
            tachesDTO.add(TacheDTO.fromTache(tache));
        }
        return tachesDTO;

}
    @PatchMapping("/statut/{id}")
    public TacheDTO changerStatut(@PathVariable int id, @RequestBody Map<String, String> body, Authentication authentication) {
        Utilisateur user=(Utilisateur) authentication.getPrincipal();
       return TacheDTO.fromTache(tacheService.modifierStatutTache(id,body.get("statut"),user));


    }
    @PostMapping()
    @PreAuthorize("hasAnyRole('ADMINISTRATEUR','CHEF_PROJET')")
    public TacheDTO addTache(@RequestBody TacheDTO tache,Authentication authentication) {
        Utilisateur user=(Utilisateur) authentication.getPrincipal();
        return tacheService.creerTache(tache,user);


    }
    @PutMapping("/{id}")
    public TacheDTO modifierTache(@PathVariable int id, @RequestBody TacheDTO dto, Authentication authentication) {
        Utilisateur user=(Utilisateur) authentication.getPrincipal();
        return tacheService.modifierTacheComplete(id,dto,user);
    }
    @GetMapping("/projet/{projetId}/membre/{membreId}")
    public ResponseEntity<List<TacheDTO>> getTachesMembre(
            @PathVariable int projetId,
            @PathVariable int membreId,
            @AuthenticationPrincipal Utilisateur acteur) {
        return ResponseEntity.ok(tacheService.getTachesParMembreEtProjet(projetId, membreId, acteur));
    }
    @PatchMapping("/avancement/{id}")
    public ResponseEntity<TacheDTO> mettreAJourAvancement(
            @PathVariable Integer id,
            @RequestBody Map<String, Double> body,
            @AuthenticationPrincipal Utilisateur utilisateurConnecte) {

        TacheDTO tacheMiseAJour = tacheService.mettreAJourAvancement(id, body.get("tauxAvancement"), utilisateurConnecte);
        return ResponseEntity.ok(tacheMiseAJour);
    }
    @GetMapping("/membre/{membreId}")
    public ResponseEntity<List<TacheDTO>> getTachesMembre(
            @PathVariable Integer membreId,
            @AuthenticationPrincipal Utilisateur utilisateur
    )
    {
        Utilisateur user=utilisateurRepository.findById(membreId).orElseThrow(()-> new EntityNotFoundException("membre not found "));
         List<TacheDTO> tacheDTOS=new ArrayList<>();
         List<Tache> taches= tacheRepository.TachesForUser(user);
         for(Tache tache : taches){
             tacheDTOS.add(TacheDTO.fromTache(tache));
         }
         return ResponseEntity.ok(tacheDTOS);

    }

}
