import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing/pages/landing-page/landing-page';
import { ClientLoginComponent } from './features/auth/pages/client-login/client-login';
import { ClientRegisterComponent } from './features/auth/pages/client-register/client-register';
import { WorkerLoginComponent } from './features/auth/pages/worker-login/worker-login';
import { WorkerRegisterComponent } from './features/auth/pages/worker-register/worker-register';
import { clientGuard } from './core/guards/client.guard';
import { workerGuard } from './core/guards/worker.guard';
import { authGuard } from './core/guards/auth.guard';

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
    path: 'create-job',
    loadComponent: () => import('./features/jobs/pages/create-job/create-job').then(m => m.CreateJobComponent),
    canActivate: [clientGuard]
  },
    {
    path: 'jobs-explorer',
    loadComponent: () => import('./features/jobs/pages/jobs-explorer/jobs-explorer').then(m => m.JobsExplorerComponent),
    canActivate: [workerGuard]
  },
  {
    path: 'dashboard-worker',
    loadComponent: () => import('./features/dashboard/pages/dashboard-worker/dashboard').then(m => m.DashboardWorker),
    canActivate: [workerGuard]
  },
  {
    path: 'dashboard-client',
    loadComponent: () => import('./features/dashboard/pages/dashboard-client/dashboard-client').then(m => m.DashboardClient),
    canActivate: [clientGuard]
  },
  {
    path: 'worker-explorer',
    loadComponent: () => import('./features/explorer/pages/worker-explorer/worker-explorer').then(m => m.WorkerExplorerComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/pages/messages-screen/messages-screen').then(m => m.MessagesScreenComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/pages/my-profile-page/my-profile-page.component').then(m => m.MyProfilePageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chat/:id',
    loadComponent: () => import('./features/messages/pages/chat-screen/chat-screen').then(m => m.ChatScreen),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/pages/notifications-page/notifications-page').then(m => m.NotificationsPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'worker/:id',
    loadComponent: () => import('./features/explorer/pages/worker-profile/worker-profile').then(m => m.WorkerProfileComponent),
    canActivate: [clientGuard]
  },
  {
    path: 'job-detail/:id',
    loadComponent: () => import('./features/jobs/pages/job-detail/job-detail').then(m => m.JobDetailComponent),
    canActivate: [workerGuard]
  }
];