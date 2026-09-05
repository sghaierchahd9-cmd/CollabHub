import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { PieceJointeService } from '../piece-jointe-service';
import { PieceJointe } from '../Model/PieceJointe';
import { LoginService } from '../login-service';
import { Utilisateur } from '../Model/Utilisateur';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-pieces-jointes-modal-component',
  imports: [CommonModule,FormsModule],
  templateUrl: './pieces-jointes-modal-component.html',
  styleUrl: './pieces-jointes-modal-component.css',
})
export class PiecesJointesModalComponent {
    @Input() tacheId!: number;
  @Output() fermer = new EventEmitter<void>();
  pieceEnEdition: number | null = null;
  nomEdition = '';
  erreurRenommage: string | null = null;
  renommageEnCours = false;
  piecesJointes: PieceJointe[] = [];
  chargement = false;
  erreurChargement = false;
  uploadEnCours = false;
  erreurUpload: string | null = null;
  connectedUser: Utilisateur | null;
  confirmationOuverte=false;
  selectedPJ: PieceJointe | null=null ;

  constructor(
    private pieceJointeService: PieceJointeService,
    private loginService: LoginService
  ) {
    this.connectedUser = this.loginService.loggedIUser;
  }

  ngOnInit(): void {
    this.getPiecesJointes();
  }

  getPiecesJointes(): void {
    this.chargement = true;
    this.erreurChargement = false;
    this.pieceJointeService.getByTache(this.tacheId).subscribe(
      (data) => {
        this.piecesJointes = data.map(json => PieceJointe.fromJson(json));
        this.chargement = false;
      },
      (error) => {
        this.erreurChargement = true;
        this.chargement = false;
      }
    );
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    if (file.size > 10 * 1024 * 1024) {
      this.erreurUpload = 'Le fichier depasse la taille maximale de 10MB';
      input.value = '';
      return;
    }

    this.erreurUpload = null;
    this.uploadEnCours = true;

    this.pieceJointeService.upload(this.tacheId, file).subscribe(
      (data) => {
        const nouvellePJ = PieceJointe.fromJson(data);
        this.piecesJointes = [...this.piecesJointes, nouvellePJ];
        this.uploadEnCours = false;
        input.value = '';
        this.erreurUpload=null;
      },
      (error) => {
        this.erreurUpload = "Erreur lors de l'upload du fichier";
        this.uploadEnCours = false;
        input.value = '';
      }
    );
  }
  demandeSuppression(pj :PieceJointe){
    this.selectedPJ=pj;
    this.confirmationOuverte=true ;
  }

  onSupprimer(): void {
   

    this.pieceJointeService.delete(this.selectedPJ!.id).subscribe(
      () => {
        this.piecesJointes = this.piecesJointes.filter(p => p.id !== this.selectedPJ?.id);
        this.confirmationOuverte=false;
        this.selectedPJ=null;
      },
      (error) => {
        alert("Impossible de supprimer cette piece jointe");
      }
    );
  }

  onTelecharger(pj: PieceJointe): void {
    this.pieceJointeService.download(pj.id).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pj.nomFichier;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        alert("Impossible de telecharger ce fichier");
      }
    );
  }

  peutSupprimer(pj: PieceJointe): boolean {
    if (!this.connectedUser) return false;
    return (
      this.connectedUser.role === 'ADMINISTRATEUR' ||
      this.connectedUser.role === 'CHEF_PROJET' ||
      this.connectedUser.id === pj.userId
    );
  }

  getIconeFichier(nomFichier: string): string {
    const ext = nomFichier.split('.').pop()?.toLowerCase() ?? '';
    if (ext === 'pdf') return 'fa-solid fa-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'fa-solid fa-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'fa-solid fa-file-excel';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'fa-solid fa-file-image';
    return 'fa-solid fa-file';
  }

  onFermer(): void {
    this.fermer.emit();
  }
  getNomBase(nomFichier: string): string {
    const dernierPoint = nomFichier.lastIndexOf('.');
    if (dernierPoint <= 0) return nomFichier;
    return nomFichier.substring(0, dernierPoint);
  }

  getExtension(nomFichier: string): string {
    const dernierPoint = nomFichier.lastIndexOf('.');
    if (dernierPoint <= 0) return '';
    return nomFichier.substring(dernierPoint);
  }

  onDemarrerRenommage(pj: PieceJointe): void {
    this.pieceEnEdition = pj.id;
    this.nomEdition = this.getNomBase(pj.nomFichier);
    this.erreurRenommage = null;
  }
  onAnnulerRenommage(): void {
    this.pieceEnEdition = null;
    this.nomEdition = '';
    this.erreurRenommage = null;
  }

  onValiderRenommage(pj: PieceJointe): void {
    const nomTrim = this.nomEdition.trim();
    if (!nomTrim) {
      this.erreurRenommage = 'Le nom ne peut pas etre vide';
      return;
    }
    this.renommageEnCours = true;
    this.pieceJointeService.renommer(pj.id, nomTrim).subscribe(
      (data) => {
        const pjMaj = PieceJointe.fromJson(data);
        this.piecesJointes = this.piecesJointes.map(p => p.id === pjMaj.id ? pjMaj : p);
        this.pieceEnEdition = null;
        this.nomEdition = '';
        this.renommageEnCours = false;
        this.erreurRenommage=null ;
      },
      (error) => {
        this.erreurRenommage = 'Impossible de renommer ce fichier';
        this.renommageEnCours = false;
      }
    );
  }

}
