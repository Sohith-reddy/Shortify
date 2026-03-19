import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./short-url/short-url').then(m => m.ShortUrl)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile').then(m => m.Profile)
    }
];
