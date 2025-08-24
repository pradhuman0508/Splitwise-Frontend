import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  // Allow immediate access during SSR to prevent timeouts
  if (isPlatformServer(platformId)) {
    return of(true);
  }

  // On client side, check authentication
  return authService.isLoggedIn().pipe(
    filter(user => user !== undefined),
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};
