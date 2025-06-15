import { UserService } from './../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { getAuth, GoogleAuthProvider, signInWithPopup, user } from '@angular/fire/auth';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { error } from 'console';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
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

    const { fullName,email, password } = this.registerForm.value;
    this.loading = true;
    this.errorMessage = '';

    this.userService
      .registerUser({fullName,email, password}).subscribe({
        next: ()=> {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed';
        },
        complete: () => {
          this.loading = false;
        }
      }
      );
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
