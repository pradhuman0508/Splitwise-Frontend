import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
},
{
  path: '',
  loadChildren: () => import('./pages/pages.routes').then(m => m.routes)
},
{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
{ path: '**', redirectTo: '/dashboard' }];
