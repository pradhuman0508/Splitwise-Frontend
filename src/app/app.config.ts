import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp({ "projectId": "splitwiseclone-49479", "appId": "1:103744049747:web:e84a58ed065d00f35aeca6", "storageBucket": "splitwiseclone-49479.firebasestorage.app", "apiKey": "AIzaSyCno8aNACzquONjWqa2aEBXZqXzZz6E8BU", "authDomain": "splitwiseclone-49479.firebaseapp.com", "messagingSenderId": "103744049747", "measurementId": "G-MR1W4X880F" })),
    provideAuth(() => getAuth()),
    provideAnimationsAsync(),
    providePrimeNG({
            theme: {
                preset: Aura
            }
        })
      ]
};

