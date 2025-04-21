import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  title = 'Register';

  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService,    private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  // Check if passwords match
  passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onRegister() {
    if (this.registerForm.valid && this.passwordsMatch()) {

      this.authService
        .register(this.registerForm.get('email')?.value, this.registerForm.get('password')?.value)
        .then(() => this.router.navigate(['/login']))
        .catch((error: { message: string; }) => (this.errorMessage = error.message));
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
    }
  }
}
