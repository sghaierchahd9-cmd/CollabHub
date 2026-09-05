import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModeTravail, ModeTravailLabels} from '../Model/ModeTravail';
import { StatutCollab, StatutCollabConfig } from '../Model/StatutCollab';
import { UtilisateurService } from '../utilisateur-service';
import { LoginService } from '../login-service';
import { Subscription } from 'rxjs';
import { NotificationSocketService } from '../notification-socket-service';
import { AvatarComponent } from "../avatar-component/avatar-component";

@Component({
  selector: 'app-parametre-component',
  imports: [CommonModule, FormsModule, AvatarComponent],
  templateUrl: './parametre-component.html',
  styleUrl: './parametre-component.css',
})
export class ParametreComponent implements OnDestroy,OnInit {
    userId!: number;

  // --- Profil ---
  nom = '';
  prenom = '';
  modeTravail: ModeTravail = ModeTravail.SUR_SITE;
  modeTravailOptions = Object.values(ModeTravail);
  modeTravailLabels = ModeTravailLabels;
  profilLoading = false;
  profilMessage: { type: 'success' | 'error'; text: string } | null = null;

  // --- Mot de passe ---
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordLoading = false;
  passwordMessage: { type: 'success' | 'error'; text: string } | null = null;
   // --- Photo de profil ---
  photoProfilUrl: string | null = null;      
  photoPreviewUrl: string | null = null;     
  fichierSelectionne: File | null = null;
  photoLoading = false;
  photoMessage: { type: 'success' | 'error'; text: string } | null = null;

  private readonly TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly TAILLE_MAX = 2 * 1024 * 1024; // 2 Mo
  // --- Statut ---
  statutOptions = Object.values(StatutCollab).filter(s => s !== StatutCollab.HORS_LIGNE);
  statutConfig = StatutCollabConfig;
  statutSelectionne: StatutCollab = StatutCollab.DISPONIBLE;
  finPrevue = ''; // format datetime-local
  statutLoading = false;
  statutMessage: { type: 'success' | 'error'; text: string } | null = null;
  private sub?: Subscription;

  constructor(
    private utilisateurService: UtilisateurService,
    private authService: LoginService,
    private notificationSocketService :NotificationSocketService
  ) {}
    ngOnInit(): void {
    const user = this.authService.loggedIUser;
    this.userId = user!.id;
    this.nom = user!.nom;
    this.prenom = user!.prenom;
    this.modeTravail = user!.modeTravail;
     this.photoProfilUrl = user!.photoProfilUrl ?? null;
     console.log('Photo de profil initiale :', this.photoProfilUrl);
    this.statutSelectionne = user!.statutActivite ?? StatutCollab.DISPONIBLE;
      this.notificationSocketService.souscrireStatutUtilisateur(this.userId);
  this.sub = this.notificationSocketService.statutRecu.subscribe(update => {
    if (update.utilisateurId === this.userId) {
      this.statutSelectionne = update.statut;
      this.finPrevue = update.finStatutPrevue ?? '';
    }
  });
  }
  ngOnDestroy(): void {
  this.notificationSocketService.desouscrireStatutUtilisateur(this.userId);
  this.sub?.unsubscribe();
}

  get requiresFin(): boolean {
    return this.statutConfig[this.statutSelectionne].requiresFin;
  }

  enregistrerProfil(): void {
    if (!this.nom.trim() || !this.prenom.trim()) {
      this.profilMessage = { type: 'error', text: 'Nom et prénom sont obligatoires.' };
      return;
    }
    this.profilLoading = true;
    this.profilMessage = null;

    this.utilisateurService.updateProfil(this.userId, {
      nom: this.nom.trim(),
      prenom: this.prenom.trim(),
      modeTravail: this.modeTravail
    }).subscribe({
      next: () => {
   this.profilMessage = { type: 'success', text: 'Profil mis à jour avec succès.' };
        this.profilLoading = false;
         const userActuel = this.authService.loggedIUser;
      if (userActuel) {
        userActuel.nom = this.nom.trim();
        userActuel.prenom = this.prenom.trim();
        userActuel.modeTravail = this.modeTravail;
        this.authService.loggedIUser = userActuel;
      }
      },
      error: () => {
        this.profilMessage = { type: 'error', text: 'Une erreur est survenue.' };
        this.profilLoading = false;
      }
    });
  }

  enregistrerMotDePasse(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMessage = { type: 'error', text: 'Les mots de passe ne correspondent pas.' };
      return;
    }
    if (this.newPassword.length < 8) {
      this.passwordMessage = { type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères.' };
      return;
    }
    this.passwordLoading = true;
    this.passwordMessage = null;

    this.utilisateurService.updatePassword(this.userId, {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.passwordMessage = { type: 'success', text: 'Mot de passe modifié avec succès.' };
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.passwordLoading = false;
      },
      error: (err) => {
        const text = err.status === 401
          ? 'Mot de passe actuel incorrect.'
          : 'Une erreur est survenue.';
        this.passwordMessage = { type: 'error', text };
        this.passwordLoading = false;
      }
    });
  }

  enregistrerStatut(): void {
    if (this.requiresFin && !this.finPrevue) {
      this.statutMessage = { type: 'error', text: 'Veuillez indiquer une heure de fin.' };
      return;
    }
    this.statutLoading = true;
    this.statutMessage = null;

    this.utilisateurService.updateStatut({
      statut: this.statutSelectionne,
      finPrevue: this.requiresFin ? new Date(this.finPrevue).toISOString() : null
    }).subscribe({
      next: () => {
        this.statutMessage = { type: 'success', text: 'Statut mis à jour.' };
        this.statutLoading = false;
      },
      error: () => {
        this.statutMessage = { type: 'error', text: 'Une erreur est survenue.' };
        this.statutLoading = false;
      }
    });
  }
   onFichierSelectionne(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fichier = input.files?.[0];
    if (!fichier) return;

    this.photoMessage = null;

  
    if (!this.TYPES_AUTORISES.includes(fichier.type)) {
      this.photoMessage = { type: 'error', text: 'Formats acceptés : JPG, PNG, WEBP.' };
      input.value = ''; // reset l'input pour permettre de resélectionner le même fichier
      return;
    }
    if (fichier.size > this.TAILLE_MAX) {
      this.photoMessage = { type: 'error', text: 'Taille maximale : 2 Mo.' };
      input.value = '';
      return;
    }

  
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.fichierSelectionne = fichier;
    this.photoPreviewUrl = URL.createObjectURL(fichier);
  }
  confirmerPhoto(): void {
  if (!this.fichierSelectionne) return;

  this.photoLoading = true;
  this.photoMessage = null;

  this.utilisateurService.uploaderPhotoProfil(this.fichierSelectionne).subscribe({
    next: (utilisateur) => {
      this.photoProfilUrl = utilisateur.photoProfilUrl ?? null;

      // Resynchronise le cache utilisateur (mémoire + localStorage)
      const userActuel = this.authService.loggedIUser;
      if (userActuel) {
        userActuel.photoProfilUrl = utilisateur.photoProfilUrl;
        this.authService.loggedIUser = userActuel;
      }

      this.photoMessage = { type: 'success', text: 'Photo de profil mise à jour.' };
      this.photoLoading = false;
      this.annulerSelectionPhoto();
    },
    error: () => {
      this.photoMessage = { type: 'error', text: "Échec de l'envoi. Réessayez." };
      this.photoLoading = false;
    }
  });
}
   annulerSelectionPhoto(): void {
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoPreviewUrl = null;
    this.fichierSelectionne = null;
  }


}
