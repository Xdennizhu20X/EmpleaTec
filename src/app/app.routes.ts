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
  },
  {
    path: 'dashboard-worker',
    loadComponent: () => import('./features/dashboard/pages/dashboard-worker/dashboard').then(m => m.DashboardWorker)
  },
  {
    path: 'dashboard-client',
    loadComponent: () => import('./features/dashboard/pages/dashboard-client/dashboard-client').then(m => m.DashboardClient)
  },
  {
    path: 'worker-explorer',
    loadComponent: () => import('./features/explorer/pages/worker-explorer/worker-explorer').then(m => m.WorkerExplorerComponent)
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/pages/messages-screen/messages-screen').then(m => m.MessagesScreen)
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./features/messages/pages/chat-screen/chat-screen').then(m => m.ChatScreen)
  }
];