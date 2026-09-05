import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../login-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-forgot-password-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
  private loginService = inject(LoginService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  envoye = false;
  chargement = false;

  onSubmit(): void {
    if (this.form.invalid) return;

    this.chargement = true;
    this.loginService.demanderResetMotDePasse(this.form.value.email!).subscribe({
      next: () => {
        this.chargement = false;
        this.envoye = true; // on affiche le message de succès, PAS d'erreur possible ici
      },
      error: () => {
        // Même en cas d'erreur réseau réelle, on garde un message générique
        this.chargement = false;
        this.envoye = true;
      }
    });
  }
}
