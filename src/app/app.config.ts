import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

const firebaseConfig = {
  apiKey: "AIzaSyAe1w1ITRO2g_i31scqCATBMejY52o0CII",
  authDomain: "empleatec-3ff49.firebaseapp.com",
  projectId: "empleatec-3ff49",
  storageBucket: "empleatec-3ff49.firebasestorage.app",
  messagingSenderId: "787428731383",
  appId: "1:787428731383:web:ec58356d366a5da61826f1"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
