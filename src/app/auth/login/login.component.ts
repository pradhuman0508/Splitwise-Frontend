import { Component } from '@angular/core';
import { GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { getAuth } from '@firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  title = 'Login';

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService
        .login(email, password)
        .then(() => this.router.navigate(['/dashboard']))
        .catch((error) => (this.errorMessage = error.message));
    }
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const auth=getAuth();
    signInWithPopup(auth, provider)
      .then(() => this.router.navigate(['/dashboard']))
      .catch((error) => (this.errorMessage = error.message));
  }

}

