import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideHttpClient } from '@angular/common/http';

// 1. Importa las funciones y datos de localización
import { registerLocaleData } from '@angular/common';
import localeEsMX from '@angular/common/locales/es-MX';

import { routes } from './app.routes';

// 2. Registra los datos del locale
registerLocaleData(localeEsMX);

const firebaseConfig = {
  apiKey: "AIzaSyAe1w1ITRO2g_i31scqCATBMejY52o0CII",
  authDomain: "empleatec-3ff49.firebaseapp.com",
  projectId: "empleatec-3ff49",
  storageBucket: "empleatec-3ff49.appspot.com",
  messagingSenderId: "787428731383",
  appId: "1:787428731383:web:ec58356d366a5da61826f1"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideHttpClient(),

    // 3. Provee el LOCALE_ID globalmente
    { provide: LOCALE_ID, useValue: 'es-MX' }
  ]
};