import { inject, Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, authState, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = inject(Auth);


  // Login with email and password
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth,email, password)
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
    return createUserWithEmailAndPassword(this.auth,email, password).catch((error) => {
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
    return authState(this.auth); // Returns Observable<firebase.User | null>
  }

  // Logout
  logout() {
    return signOut(this.auth);
  }
}
