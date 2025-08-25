import Aura from '@primeng/themes/aura';
import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling  } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

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
        return initializeApp({
          "projectId":"splitwiseclone-49479",
          "appId":"1:103744049747:web:e84a58ed065d00f35aeca6",
          "storageBucket":"splitwiseclone-49479.firebasestorage.app",
          "apiKey":"AIzaSyCno8aNACzquONjWqa2aEBXZqXzZz6E8BU",
          "authDomain":"splitwiseclone-49479.firebaseapp.com",
          "messagingSenderId":"103744049747",
          "measurementId":"G-MR1W4X880F"
        });
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
    AuthInterceptor
  ],
};
