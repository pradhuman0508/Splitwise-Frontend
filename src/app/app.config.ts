import Aura from '@primeng/themes/aura';
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling  } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options:{
              darkModeSelector: '.app-dark',
            }
        }
    }),
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
        routes,
        withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
        withEnabledBlockingInitialNavigation()
    ),
    provideClientHydration(),
    // Firebase providers with platform checks
    provideFirebaseApp(() => {
      // Only initialize Firebase on client side
      if (typeof window !== 'undefined') {
        return initializeApp(environment.firebase);
      }
      // Return a minimal app for SSR
      return initializeApp({}, 'ssr-app');
    }),
    provideAuth(() => {
      if (typeof window !== 'undefined') {
        return getAuth();
      }
      // Return a mock auth for SSR
      return {} as any;
    }),
    provideFirestore(() => {
      if (typeof window !== 'undefined') {
        return getFirestore();
      }
      // Return a mock firestore for SSR
      return {} as any;
    }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
};
