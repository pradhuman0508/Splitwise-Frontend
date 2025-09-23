import { inject, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, authState, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth | null = null;
  private isBrowser: boolean;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuth(): Auth | null {
    if (!this.auth && this.isBrowser) {
      try {
        this.auth = inject(Auth);
        // Set persistence only when we're absolutely sure we're in browser
        this.setPersistenceSafely();
      } catch (error) {
        console.warn('Could not initialize auth service:', error);
        return null;
      }
    }
    return this.auth;
  }

  private setPersistenceSafely(): void {
    // Temporarily disabled persistence to avoid SSR issues
    // Persistence will be set to default (local) by Firebase automatically
  }

  // Login with email and password
  login(email: string, password: string) {
    if (!this.isBrowser) {
      return Promise.reject(new Error('Authentication is only available in browser environment'));
    }

    const auth = this.getAuth();
    if (!auth) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    return signInWithEmailAndPassword(auth, email, password)
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

    const auth = this.getAuth();
    if (!auth) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    return createUserWithEmailAndPassword(auth, email, password)
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
    const auth = this.getAuth();
    if (!auth) {
      return of(null);
    }
    return authState(auth);
  }

  // Logout
  logout() {
    if (this.isBrowser) {
      this.router.navigate(['/auth/login']);
      const auth = this.getAuth();
      if (auth) {
        return signOut(auth);
      }
    }
    return Promise.resolve();
  }

  // Login with Google
  loginWithGoogle() {
    if (!this.isBrowser) {
      return Promise.reject(new Error('Authentication is only available in browser environment'));
    }

    const auth = this.getAuth();
    if (!auth) {
      return Promise.reject(new Error('Authentication service not available'));
    }

    try {
      const provider = new GoogleAuthProvider();

      return signInWithPopup(auth, provider)
        .catch((error) => {
          // Handle error codes here and return a custom error message
          let errorMessage = '';

          switch (error.code) {
            case 'auth/popup-closed-by-user':
            case 'auth/cancelled-popup-request':
              errorMessage = 'Login was cancelled. Please try again.';
              break;
            case 'auth/popup-blocked':
              errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
              break;
            case 'auth/unauthorized-domain':
              errorMessage = 'This domain is not authorized for Google login. Please contact support.';
              break;
            default:
              errorMessage = 'Google login failed. Please try again.';
          }

          // Throw the custom error message
          throw new Error(errorMessage);
        });
    } catch (error) {
      return Promise.reject(new Error('Failed to initialize Google authentication'));
    }
  }
}
