import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'',
        loadComponent:()=>import('./short-url/short-url').then(m=>m.ShortUrl)
    }
];
