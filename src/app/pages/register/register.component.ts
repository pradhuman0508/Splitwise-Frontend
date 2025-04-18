import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
  passwordsDoNotMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    return password !== confirmPassword;
  }

  onRegister() {
    if (this.registerForm.valid && !this.passwordsDoNotMatch()) {
      const { email, password } = this.registerForm.value;

      this.authService
        .register(email, password)
        .then(() => this.router.navigate(['/login']))
        .catch((error) => (this.errorMessage = error.message));
    } else {
      this.errorMessage = 'Please fill out the form correctly.';
    }
  }
}
