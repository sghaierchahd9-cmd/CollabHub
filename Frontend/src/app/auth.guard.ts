// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login-service';

export const authGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const token = loginService.token;

  if (!token) {
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  // Optionnel mais recommandé : vérifier l'expiration du JWT
  if (estTokenExpire(token)) {
    loginService.logout();
    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }

  return true;
};

export function estTokenExpire(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationMs = payload.exp * 1000;
    return Date.now() >= expirationMs;
  } catch {
    return true; // token malformé = traité comme expiré
  }
}