import { CommonModule } from '@angular/common';
import { LoginService } from './../login-service';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, AbstractControl, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-reset-password-component',
  imports: [CommonModule, FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.css',
})
export class ResetPasswordComponent {
    private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required]
  }, { validators: this.motsDePasseIdentiquesValidator });

  token = '';
  chargement = false;
  erreur = '';
  succes = false;
  tokenAbsent = false;

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');
    if (!tokenParam) {
      this.tokenAbsent = true;
      return;
    }
    this.token = tokenParam;
  }

  private motsDePasseIdentiquesValidator(group: AbstractControl): ValidationErrors | null {
    const mdp = group.get('nouveauMotDePasse')?.value;
    const confirmation = group.get('confirmation')?.value;
    return mdp === confirmation ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.chargement = true;
    this.erreur = '';

    this.loginService.reinitialiserMotDePasse(this.token, this.form.value.nouveauMotDePasse!).subscribe({
      next: () => {
        this.chargement = false;
        this.succes = true;
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.chargement = false;
        // Le backend renvoie le message exact via GlobalExceptionHandler (TokenInvalideException)
        this.erreur = err.error?.message ?? 'Une erreur est survenue, réessayez.';
      }
    });
  }

}
