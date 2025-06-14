import Aura  from '@primeng/themes/aura';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling  } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from "@primeng/themes";
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth, browserLocalPersistence, setPersistence } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura,
            options:{
            darkModeSelector: '.app-dark',
            }
        }
    }),
    provideHttpClient(withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
        routes, 
        withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), 
        withEnabledBlockingInitialNavigation()
        
    ),
    provideClientHydration(),

    provideFirebaseApp(() => 
        initializeApp({
            "projectId":"splitwiseclone-49479",
            "appId":"1:103744049747:web:e84a58ed065d00f35aeca6",
            "storageBucket":"splitwiseclone-49479.firebasestorage.app",
            "apiKey":"AIzaSyCno8aNACzquONjWqa2aEBXZqXzZz6E8BU",
            "authDomain":"splitwiseclone-49479.firebaseapp.com",
            "messagingSenderId":"103744049747",
            "measurementId":"G-MR1W4X880F"
        })),
    provideAuth(() => {
        const auth = getAuth();
        setPersistence(auth, browserLocalPersistence);
        return auth;
    })]
};
