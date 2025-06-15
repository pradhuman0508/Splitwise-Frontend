import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, tap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      map(user => !!user),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);
        }
      })
    );
  }
}
