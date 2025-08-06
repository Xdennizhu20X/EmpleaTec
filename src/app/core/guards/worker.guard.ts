import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const workerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUserProfile().pipe(
    map(profile => {
      if (profile && profile.userType === 'worker') {
        return true;
      } else {
        // Redirigir a una página de no autorizado o al login
        return router.createUrlTree(['/login-worker']); // O una página de error/acceso denegado
      }
    })
  );
};
