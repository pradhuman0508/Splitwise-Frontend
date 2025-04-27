import { Component, Renderer2 } from '@angular/core';
import { GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { getAuth } from '@firebase/auth';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; // Ripple is now separated
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isDarkMode = false;
  title = 'Login';

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = prefersDark;
    if (prefersDark) {
      this.renderer.addClass(document.body, 'app-dark');
    } else {
      this.renderer.removeClass(document.body, 'app-dark');
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      this.isDarkMode = e.matches;
      if (e.matches) {
        this.renderer.addClass(document.body, 'app-dark');
      } else {
        this.renderer.removeClass(document.body, 'app-dark');
      }
    });
  }

  toggleDarkMode() {
    if (document.body.classList.contains('app-dark')) {
      this.renderer.removeClass(document.body, 'app-dark');
      this.isDarkMode = false;
    } else {
      this.renderer.addClass(document.body, 'app-dark');
      this.isDarkMode = true;
    }
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

