// guest.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from './login-service';
import { estTokenExpire } from './auth.guard';

export const guestGuard: CanActivateFn = () => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const token = loginService.token;

  if (token && !estTokenExpire(token)) {
    router.navigate(['/home'], { replaceUrl: true });
    return false;
  }

  return true;
};