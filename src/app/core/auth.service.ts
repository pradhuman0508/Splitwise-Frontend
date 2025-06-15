import { inject, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, authState, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // Login with email and password
  login(email: string, password: string) {
    if (!this.isBrowser) {
      return Promise.reject(new Error('Authentication is only available in browser environment'));
    }
    
    return signInWithEmailAndPassword(this.auth, email, password)
      .catch((error) => {
        // Handle error codes here and return a custom error message
        let errorMessage = '';

        switch (error.code) {
          case 'auth/invalid-credential':
            errorMessage = 'The email or password you entered \n is incorrect. Please check and try again.';
            break;
          default:
            errorMessage = 'An error occurred. Please try again.';
        }

        // Throw the custom error message
        throw new Error(errorMessage);
      });
  }

  // Register a new user
  register(email: string, password: string) {
    if (!this.isBrowser) {
      return Promise.reject(new Error('Authentication is only available in browser environment'));
    }

    return createUserWithEmailAndPassword(this.auth, email, password)
      .catch((error) => {
        // Handle error codes here and return a custom error message
        let errorMessage = '';

        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered. Please use a different email.';
            break;
          default:
            errorMessage = 'An error occurred. Please try again.';
        }

        // Throw the custom error message
        throw new Error(errorMessage);
      });
  }

  // Check if user is logged in
  isLoggedIn() {
    if (!this.isBrowser) {
      return of(null); // Return Observable<null> for SSR
    }
    return authState(this.auth);
  }

  // Logout
  logout() {
    if (this.isBrowser) {
      this.router.navigate(['/auth/login']);
      return signOut(this.auth);
    }
    return Promise.resolve();
  }
}
