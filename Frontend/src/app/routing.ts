import { RouterModule } from '@angular/router';
import { HomeComponent } from './home-component/home-component';
import { LoginComponent } from './login-component/login-component';
import { ProjetComponent } from './projet-component/projet-component';
import { Component } from '@angular/core';
import { TachesComponent } from './taches-component/taches-component';
import { CollaborateurComponent } from './collaborateur-component/collaborateur-component';
import { ProjetDetailComponent } from './projet-detail-component/projet-detail-component';
import { LayoutComponent } from './layout-component/layout-component';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { ParametreComponent } from './parametre-component/parametre-component';
import { PoleComponent } from './pole-component/pole-component';
import { AccesDeniedComponent } from './acces-denied-component/acces-denied-component';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { ResetPasswordComponent } from './reset-password-component/reset-password-component';
import { ForgotPasswordComponent } from './forgot-password-component/forgot-password-component';
export const app_routes = [
 { path: 'login', component: LoginComponent,canActivate: [guestGuard] },
   { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
  
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'projets', component: ProjetComponent },
      { path: 'membres', component: CollaborateurComponent },
      { path: 'taches', component: TachesComponent },
      { path: 'projets/:id',component: ProjetDetailComponent},
      {path:'parametres',component : ParametreComponent},
      { path: 'poles', component: PoleComponent },
      { path: 'acces-refuse', component: AccesDeniedComponent },
      {path: 'not-found', component: NotFoundComponent}
    ],
  },
  { path: '**', redirectTo: 'login' }
   
]
 export const routing = RouterModule.forRoot(app_routes);