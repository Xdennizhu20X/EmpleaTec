import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page/landing-page';
import { ClientLoginComponent } from './features/auth/pages/client-login/client-login';
import { ClientRegisterComponent } from './features/auth/pages/client-register/client-register';
import { WorkerLoginComponent } from './features/auth/pages/worker-login/worker-login';
import { WorkerRegisterComponent } from './features/auth/pages/worker-register/worker-register';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent
  },
  {
    path: 'login-client',
    component: ClientLoginComponent
  },
  {
    path: 'register-client',
    component: ClientRegisterComponent
  },
  {
    path: 'login-worker',
    component: WorkerLoginComponent
  },
  {
    path: 'register-worker',
    component: WorkerRegisterComponent
  }
];