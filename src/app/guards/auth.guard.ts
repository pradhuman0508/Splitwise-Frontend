import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { FirebaseService } from '../services/firebase.service';
import { onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    try {
      const user = await this.getUserAuthState();
      if (user) {
        return true; // Allow access if the user is authenticated
      } else {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false; // Redirect to login if not authenticated
      }
    } catch (error) {
      console.error('AuthGuard Error:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }

  private getUserAuthState(): Promise<any> {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(
        this.firebaseService.auth,
        (user) => resolve(user),
        (error) => reject(error)
      );
    });
  }
}
