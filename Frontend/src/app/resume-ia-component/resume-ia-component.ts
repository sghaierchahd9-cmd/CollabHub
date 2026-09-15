import { Component, Input } from '@angular/core';
import { ResumeIaService } from '../resume-ia-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resume-ia-component',
  imports: [CommonModule],
  templateUrl: './resume-ia-component.html',
  styleUrl: './resume-ia-component.css',
})
export class ResumeIaComponent {
   @Input({ required: true }) projetId!: number;

  contenu: string | null = null;
  chargement = false;
  erreur: string | null = null;

  constructor(private resumeIaService: ResumeIaService) {}

  ngOnInit(): void {
    this.chargerResume(false);
  }

  chargerResume(forcer: boolean): void {
    this.chargement = true;
    this.erreur = null;
    this.resumeIaService.getResume(this.projetId, forcer).subscribe({
      next: (data) => {
        this.contenu = data.contenu;
        this.chargement = false;
      },
      error: (err) => {
        this.erreur = err.status === 503
          ? "Le service de résumé IA est momentanément indisponible."
          : "Impossible de charger le résumé.";
        this.chargement = false;
      }
    });
  }

  regenerer(): void {
    this.chargerResume(true);
  }
}
