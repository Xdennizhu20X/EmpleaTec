import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUserProfile().pipe(
    map(profile => {
      if (profile) {
        return true;
      } else {
        // Redirect to landing page if not logged in
        return router.createUrlTree(['/']);
      }
    })
  );
};
