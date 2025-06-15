import Aura from '@primeng/themes/aura';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling  } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from "@primeng/themes";
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth, browserLocalPersistence, initializeAuth, indexedDBLocalPersistence } from '@angular/fire/auth';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { inject } from '@angular/core';

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
        const platformId = inject(PLATFORM_ID);
        const app = getApp();
        if (isPlatformBrowser(platformId)) {
            return initializeAuth(app, {
                persistence: [indexedDBLocalPersistence, browserLocalPersistence]
            });
        }
        return getAuth(app);
    })]
};
