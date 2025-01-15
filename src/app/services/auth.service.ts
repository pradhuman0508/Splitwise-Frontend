import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';


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

  // Register a new user
  register(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password).catch((error) => {
      // Handle error codes here and return a custom error message
      console.log('Error message',error.code,'YYash');
      let errorMessage = '';
  
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid. Please check and try again.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please use a stronger password.';
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
