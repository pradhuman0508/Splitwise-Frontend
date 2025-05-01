import { Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; 
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { LoginButtonComponent } from '../../auth/login-button/login-button.component';



@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [LoginButtonComponent,CommonModule, ButtonModule, RippleModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  animations: [
    trigger('fadeScale', [
      state('hidden', style({
        opacity: 0,
        transform: 'scale(0.8)'
      })),
      state('visible', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('hidden => visible', [
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)')
      ]),
    ]),
  ],
})
export class LandingComponent {
  cardState = 'hidden';
  isDarkMode = false;
  title = 'Landing';

  errorMessage: string = '';

  constructor(
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {  
      const updateTheme = (dark: boolean) => {
        this.isDarkMode = dark;
        if (dark) {
          this.renderer.addClass(document.body, 'app-dark');
        } else {
          this.renderer.removeClass(document.body, 'app-dark');
        }
      };
  
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      updateTheme(prefersDark);
  
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        updateTheme(e.matches);
      });
    }
    setTimeout(() => {
      this.cardState = 'visible';
    }, 100);
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
}