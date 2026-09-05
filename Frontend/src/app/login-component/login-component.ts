import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilisateurService } from '../utilisateur-service';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass, NgIf } from '@angular/common';
import { Utilisateur } from '../Model/Utilisateur';
import { LoginService } from '../login-service';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule,NgIf,NgClass,RouterLink],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
  errorMessage: string = '';
  motDePasseVisible = false;

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    private loginService: LoginService
  ) {}

  login(form: any) {
    return this.loginService
      .getUtilisateur(form.value.email, form.value.password)
      .subscribe({
        next: (data) => {
          const user: Utilisateur = Utilisateur.fromJson(data.user);
          this.utilisateurService.addUtilisateur(user);
          this.loginService.loggedIUser = user;
          this.loginService.token = data.token;
          this.router.navigate(['home']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.errorMessage = 'email ou mot de passe incorrecte';
          } 
          else if (err.status === 403){
            this.errorMessage= 'Ce compte est suspendu'
          }
           else {
            this.errorMessage = 'Une erreur est survenue';
          }
        },
      });
  }
}
