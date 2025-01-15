import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) { }

  // Login with email and password
  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password)
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

  // Check if user is logged in
  isLoggedIn() {
    return this.afAuth.authState;
  }

  // Logout
  logout() {
    return this.afAuth.signOut();
  }
}
