import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { getAuth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: this.passwordMatchValidator });
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
    const provider = new GoogleAuthProvider();
        const auth=getAuth();
        signInWithPopup(auth, provider)
          .then(() => this.router.navigate(['/dashboard']))
          .catch((error) => (this.errorMessage = error.message));
  }
  // Custom validator
passwordMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password')?.value;
  const confirm = formGroup.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}
}
