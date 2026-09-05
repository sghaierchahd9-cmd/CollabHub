package com.chahd.collabproject.Controller;

import com.chahd.collabproject.DTO.*;
import com.chahd.collabproject.Enum.StatutCollab;
import com.chahd.collabproject.Exceptions.EmailDejaExistantException;
import com.chahd.collabproject.entity.*;
import com.chahd.collabproject.repository.*;
import com.chahd.collabproject.service.PhotoProfileService;
import com.chahd.collabproject.service.ProjetService;
import com.chahd.collabproject.service.UtilisateurService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.springframework.security.authorization.AuthorityReactiveAuthorizationManager.hasRole;


@RestController
@RequestMapping("api/utilisateurs")

@CrossOrigin(origins = "http://localhost:4200")
public class UtilisateurController {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final UtilisateurService utilisateurService;
    private final UtilisateurDTO utilisateurDTO;
    private final ProjetRepository projetRepository;
    private final ProjetService projetService;
    private final EquipeRepository equipeRepository;
    private final TacheRepository tacheRepository;
    private final MembrePoleRepository membrePoleRepository;
    private final MembreProjetRepository membreProjetRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PhotoProfileService photoProfilService;
    @Value("${app.upload.dir.profils}")
    private String uploadDirProfils;

    public UtilisateurController(UtilisateurRepository utilisateurRepository , PasswordEncoder passwordEncoder
            , ProjetRepository projetRepository,
                                 ProjetService projetService, EquipeRepository equipeRepository
                    , UtilisateurService utilisateurService , TacheRepository tacheRepository,
                                 MembrePoleRepository membrePoleRepository,
                                 MembreProjetRepository membreProjetRepository,
                                 SimpMessagingTemplate messagingTemplate,
                                 PhotoProfileService photoProfilService) {
        this.utilisateurRepository = utilisateurRepository;
        this.utilisateurService = utilisateurService;
        this.passwordEncoder = passwordEncoder ;
        this.utilisateurDTO = new UtilisateurDTO();
        this.projetRepository = projetRepository;
        this.projetService = projetService;
        this.equipeRepository = equipeRepository;
        this.tacheRepository = tacheRepository;
        this.membrePoleRepository = membrePoleRepository;
        this.membreProjetRepository = membreProjetRepository;
        this.messagingTemplate = messagingTemplate;
        this.photoProfilService=photoProfilService;

    }
    // la fonction return tous les utilisateurs pour l'Admin , les collaborateurs dans les projets et les membres dee l'equipe fixe pour le chef_projet et pour un collaborateur
    //pour la notion d'Equipe (equipe creer par l'ADMIN on va la traiter ailleurs
    @GetMapping()
    public List<UtilisateurDTO> getCollaborateursVisibles(Authentication authentication) {
        Utilisateur user = (Utilisateur) authentication.getPrincipal();
        return utilisateurService.getCollaborateursVisibles(user);
    }
    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDTO> findById(@PathVariable int id){
        UtilisateurDTO utilisateurDTO = new UtilisateurDTO();
        ResponseEntity<Utilisateur> response = utilisateurRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        if(response.getStatusCode().is2xxSuccessful()){
            return ResponseEntity.ok(utilisateurDTO.fromUtilisateur(response.getBody()));
        }
        else{
            return ResponseEntity.notFound().build();

    }}


    @PostMapping()
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public UtilisateurDTO create(@RequestBody CreationUtilisateurRequest request) {
      return utilisateurService.creerUtilisateur(request);
    }
        // pour la sécurité on va traiter la modification de mdp separement
    @PutMapping("/{id}")
     public ResponseEntity<Utilisateur> update(@PathVariable int id, @RequestBody UtilisateurDTO user){
        return utilisateurRepository.findById(id)
                .map(existing -> {
                    existing.setNom(user.getNom());
                    existing.setPrenom(user.getPrenom());
                    existing.setEmail(user.getEmail());
                    existing.setRole(user.getRole());
                    return ResponseEntity.ok(utilisateurRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    @Transactional
    public ResponseEntity<Void> Softdelete(@PathVariable int id){
        utilisateurService.supprimer(id);
        return ResponseEntity.ok().build() ;

    }



    // changement de mot de passe :


    @PutMapping("/password/{id}")
    public ResponseEntity<?> updatePassword(@PathVariable int id, @RequestBody UpdatePasswordDTO dto) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(id);

        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur inexistant");
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        boolean matches = passwordEncoder.matches(dto.getCurrentPassword(), utilisateur.getMotDePasse());
        if (!matches) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Mot de passe actuel incorrect");
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(dto.getNewPassword()));
        utilisateurRepository.save(utilisateur);

        return ResponseEntity.status(HttpStatus.OK).body("Password updated successfully");
    }
    //la fonction qui va retourner les membres de l'equipe fixe (creé par l'admin)
    @GetMapping("/membres/{id}")
    public List<UtilisateurDTO> getMembreEquipe(@PathVariable int id){
        Equipe equipe = equipeRepository.findById(id).get();
        List<UtilisateurDTO> utilisateurDTOs = new ArrayList<>();
        if( equipe != null) {
            List<MembrePole> mps = membrePoleRepository.findByEquipeIdAndDateSuppressionIsNull(equipe.getId());
            List<Utilisateur> members = new ArrayList<>();
            for (MembrePole membrePole : mps) {
                members.add(membrePole.getUtilisateur());
            }
            for (Utilisateur utilisateur : members) {
                int nbProjets;
                if(utilisateur.getRole().equals("COLLABORATEUR")) {
              nbProjets = membreProjetRepository.countByUtilisateurId(utilisateur.getId());}
                else{
                  nbProjets=projetRepository.countProjetsForChef(utilisateur);
                }
                int nbTaches = tacheRepository.countTachesForUser(utilisateur);
                utilisateurDTOs.add(UtilisateurDTO.FromUtilisateurAvecStats(utilisateur,nbProjets,nbTaches));
            }
        }
        return utilisateurDTOs;
    }
    @GetMapping("/equipe/{id}")
    public List<Equipe> getEquipe(@PathVariable int id){
        Utilisateur user = utilisateurRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable"));

        if (user.getRole().equals("ADMINISTRATEUR")) {
            return equipeRepository.findAllByDateSuppressionIsNull();
        }

        return membrePoleRepository.findByUtilisateurIdAndDateSuppressionIsNull(id).stream()
                .map(MembrePole::getEquipe)
                .distinct()
                .toList();
    }
    @GetMapping("/projet/{id}")
    public ResponseEntity<?> getCollaborateurByProjet(@PathVariable int id){
        Projet p = projetRepository.findById(id).get();
        if(p==null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur inexistant");
        }
        else{
            List<Utilisateur> utilisateurs = p.getCollaborateurs();
            List<UtilisateurDTO> utilisateurDTOS = new ArrayList<>();
            for(Utilisateur utilisateur : utilisateurs){
                utilisateurDTOS.add(UtilisateurDTO.fromUtilisateur(utilisateur));
            }
            return ResponseEntity.ok(utilisateurDTOS);
        }

    }

    @GetMapping("/role/{role}")
    public List<UtilisateurDTO> getusersByRole(@PathVariable String role){
       List<Utilisateur> users= utilisateurRepository.findByRole(role) ;
       List<UtilisateurDTO> dtos=new ArrayList<>();
       for(Utilisateur u:users){
           dtos.add(utilisateurDTO.fromUtilisateur(u));

       }
       return dtos ;

    }
    @GetMapping("/tache/{id}")
    public List<UtilisateurDTO> getResponsablesTache(@PathVariable int id){
        Tache tache = tacheRepository.findById(id).orElseThrow(()-> new EntityNotFoundException("tachen'existe pas"));
        List<UtilisateurDTO> dtos=new ArrayList<>();
       List<Utilisateur>  users= utilisateurRepository.findByTache(tache);
       for(Utilisateur u:users){
           dtos.add(utilisateurDTO.fromUtilisateur(u));
       }
       return dtos;
    }
    public record DeclarationStatutRequest(StatutCollab statut, OffsetDateTime finPrevue) {}

    @PostMapping("/statut")
    public ResponseEntity<?> declarerStatut(@RequestBody DeclarationStatutRequest req,
                                            Authentication auth) {
        Utilisateur utilisateur = (Utilisateur) auth.getPrincipal();
        utilisateur=utilisateurRepository.findByIdWithMembresPoles(utilisateur.getId()).get();

        if (req.statut() == StatutCollab.HORS_LIGNE) {
            return ResponseEntity.badRequest()
                    .body("HORS_LIGNE est géré automatiquement, pas déclarable manuellement.");
        }

        if (req.statut() == StatutCollab.EN_REUNION || req.statut() == StatutCollab.EN_PAUSE) {
            if (req.finPrevue() == null || !req.finPrevue().isAfter(OffsetDateTime.now())) {
                return ResponseEntity.badRequest().body("Une heure de fin future est requise.");
            }
            utilisateur.setFinStatutPrevue(req.finPrevue());
        } else {
            utilisateur.setFinStatutPrevue(null);
        }

        utilisateur.setStatutActivite(req.statut());
        utilisateurRepository.save(utilisateur);
        messagingTemplate.convertAndSend(
                "/topic/utilisateurs/" + utilisateur.getId() + "/statut",
                new StatutUpdateMessage(utilisateur.getId(), utilisateur.getStatutActivite(), utilisateur.getFinStatutPrevue())
        );
        return ResponseEntity.ok(UtilisateurDTO.fromUtilisateur(utilisateur));
    }
    @PutMapping("/profil/{id}")

    public ResponseEntity<?> updateProfil(@PathVariable int id, @RequestBody UpdateProfileDTO dto) {
        Optional<Utilisateur> utilisateurOpt = utilisateurRepository.findById(id);

        if (utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur inexistant");
        }

        Utilisateur utilisateur = utilisateurOpt.get();

        if (dto.getNom() == null || dto.getNom().isBlank()
                || dto.getPrenom() == null || dto.getPrenom().isBlank()) {
            return ResponseEntity.badRequest().body("Nom et prénom sont obligatoires");
        }

        utilisateur.setNom(dto.getNom().trim());
        utilisateur.setPrenom(dto.getPrenom().trim());
        if (dto.getModeTravail() != null) {
            utilisateur.setModeTravail(dto.getModeTravail());
        }

        utilisateurRepository.save(utilisateur);

        return ResponseEntity.ok(UtilisateurDTO.fromUtilisateur(utilisateur));
    }
    @ExceptionHandler(EmailDejaExistantException.class)
    public ResponseEntity<Map<String, String>> handleEmailDuplique(EmailDejaExistantException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", ex.getMessage()));
    }

    @PostMapping("/photo-profil")
    public ResponseEntity<UtilisateurDTO> uploaderPhotoProfil(
            @RequestParam("fichier") MultipartFile fichier,
            Authentication authentication) throws IOException {

        Utilisateur utilisateur = (Utilisateur) authentication.getPrincipal();

        Utilisateur user = utilisateurRepository.findById(utilisateur.getId())
                .orElseThrow(() -> new EntityNotFoundException());

        String ancienneUrl = user.getPhotoProfilUrl(); // garder une référence avant écrasement

        String nouvelleUrl = photoProfilService.uploader(fichier, utilisateur.getId());

        user.setPhotoProfilUrl(nouvelleUrl);
        utilisateurRepository.save(user);

        // Suppression de l'ancien fichier seulement après succès du nouvel upload
        if (ancienneUrl != null) {
            photoProfilService.supprimerFichierPhysique(ancienneUrl);
        }

        return ResponseEntity.ok(UtilisateurDTO.fromUtilisateur(user));
    }
    @GetMapping("/uploads/profils/{nomFichier}")
    public ResponseEntity<Resource> getPhotoProfil(@PathVariable String nomFichier) throws IOException {
        Path base = Paths.get(uploadDirProfils).toAbsolutePath().normalize();
        Path chemin = base.resolve(nomFichier).normalize();

        if (!chemin.startsWith(base)) {
            return ResponseEntity.badRequest().build();
        }

        Resource resource = new UrlResource(chemin.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(chemin);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().build().toString())
                .body(resource);
    }
}


