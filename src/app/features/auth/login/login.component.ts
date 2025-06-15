import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    RouterModule
  ],
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required,Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')], // At least 8 characters, one uppercase, one lowercase, one number
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
