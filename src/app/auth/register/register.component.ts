import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { LayoutService } from '../../layout/service/layout.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public layoutService: LayoutService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: this.passwordMatchValidator });
  }


  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
}

  onRegister(): void {
    if (this.registerForm.invalid) return;

    const { email, password } = this.registerForm.value;
    this.loading = true;
    this.errorMessage = '';

    this.authService
      .register(email, password)
      .then(() => {
        this.router.navigate(['/auth/login']); // Update if needed
      })
      .catch((err) => {
        this.errorMessage = err.message || 'Registration failed';
      })
      .finally(() => {
        this.loading = false;
      });
  }

  registerWithGoogle() {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.loginWithGoogle()
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch((error) => {
        this.errorMessage = error.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }
  // Custom validator
passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password')?.value;
  const confirm = formGroup.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}
}
