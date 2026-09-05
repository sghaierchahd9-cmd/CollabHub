import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from './login-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);
  const router = inject(Router);
  const token = loginService.token;

  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        
        loginService.logout();
        router.navigate(['/login'], { replaceUrl: true });
      }
      

      return throwError(() => err);
    })
  );
};