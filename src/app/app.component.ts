import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'splitwise-frontend';
  isLoggedIn = false;
  constructor(private authService: AuthService, private router: Router) {
    // Subscribe to authentication state
    this.authService.isLoggedIn().subscribe((user) => {
      this.isLoggedIn = !!user; // True if user is logged in
    });
  }

  // Logout user and navigate to login
  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
