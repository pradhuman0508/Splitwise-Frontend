import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { LayoutService } from '../../layout/service/layout.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public layoutService: LayoutService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  toggleDarkMode() {
    if (this.isBrowser) {
      this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
  }

  onLogin(): void {
    if (!this.isBrowser) return;
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
    if (!this.isBrowser) return;
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then(() => this.router.navigate(['/dashboard']))
      .catch((error) => (this.errorMessage = error.message));
  }
}
