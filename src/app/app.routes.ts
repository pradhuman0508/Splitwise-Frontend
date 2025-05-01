import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
},
{
  path: 'dashboard',
  loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
},
{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
{ path: '**', redirectTo: '/dashboard' }];
