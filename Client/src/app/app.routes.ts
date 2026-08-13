import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./short-url/short-url').then((m) => m.ShortUrl),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'bulk',
    loadComponent: () => import('./bulk/bulk').then((m) => m.Bulk),
  },
  {
    path: 'link/:shortCode',
    loadComponent: () => import('./link-detail/link-detail').then((m) => m.LinkDetail),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.Profile),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
