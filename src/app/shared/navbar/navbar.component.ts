import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { User } from 'firebase/auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import { Avatar } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule,RouterModule,NgIf, Avatar, MenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  loggedInUser$: Observable<User | null>;
  userMenu: any[];

  @ViewChild('menu') menu!: Menu;


  constructor(private authService: AuthService,private router: Router) {
    this.loggedInUser$ = this.authService.isLoggedIn();
    this.userMenu = [
      {
        label: 'Profile Settings',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/profile-settings'])
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  logout(): void {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });;
  }

  toggleMenu(event: Event): void {
    this.menu.toggle(event);
  }
}
