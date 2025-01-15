import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  app: any;
  auth: any;
  firestore: any;
  analytics: any;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebase);

    // Firebase Authentication
    this.auth = getAuth(this.app);

    // Firebase Firestore
    this.firestore = getFirestore(this.app);

    // Firebase Analytics (optional)
    if (environment.production) {
      this.analytics = getAnalytics(this.app);
    }

    console.log('Firebase initialized successfully');
  }
}
