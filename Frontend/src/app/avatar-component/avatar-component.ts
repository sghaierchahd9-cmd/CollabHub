import { Component, Input, OnChanges, SimpleChanges, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar-component',
  imports: [CommonModule],
  templateUrl: './avatar-component.html',
  styleUrl: './avatar-component.css',
})


export class AvatarComponent implements OnChanges {
  private apiUrl = "http://localhost:8080/api/utilisateurs";
  @Input({ required: true }) nom!: string;
  @Input({ required: true }) prenom!: string;
  @Input() photoProfilUrl: string | null = null;
  @Input() taille: 'sm' | 'md' | 'lg' = 'md';

  imageEnErreur = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photoProfilUrl']) {
      this.imageEnErreur.set(false);
    }
  }

  get initiales(): string {
    const i1 = this.prenom?.charAt(0) ?? '';
    const i2 = this.nom?.charAt(0) ?? '';
    return (i1 + i2).toUpperCase();
  }

  get urlComplete(): string | null {
    const nomFichier = this.nomFichierSeul;
    if (!nomFichier || this.imageEnErreur()) return null;
    return `${this.apiUrl}/uploads/profils/${nomFichier}`;
  }

  onImageError(): void {
    this.imageEnErreur.set(true);
  }

  private get nomFichierSeul(): string | null {
    if (!this.photoProfilUrl) return null;
    return this.photoProfilUrl.split('/').pop() ?? null;
  }

  get classesTaille(): string {
    const map: Record<string, string> = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-16 h-16 text-2xl'
    };
    return map[this.taille];
  }
  get classeCouleur(): string {
  const couleurs = ['bg-[#020b7d]', 'bg-[#5b6cb0]', 'bg-[#69a9cf]', 'bg-[#02587d]', 'bg-[#188ea1]'];
  const index = (this.prenom?.charCodeAt(0) ?? 0) % couleurs.length;
  return couleurs[index];
}
}
