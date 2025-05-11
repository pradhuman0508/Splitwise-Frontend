import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login(email, password)
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        this.errorMessage = error.message || 'Login failed';
      })
      .finally(() => {
        this.loading = false;
      });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const auth=getAuth();
    signInWithPopup(auth, provider)
      .then(() => this.router.navigate(['/dashboard']))
      .catch((error) => (this.errorMessage = error.message));
  }
}
