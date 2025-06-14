import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
},
{
  path: '',
  loadChildren: () => import('./pages/pages.routes').then(m => m.routes),
  canActivate: [authGuard]
},
{ path: '', redirectTo: '/dashboard', pathMatch: 'full' },
{ path: '**', redirectTo: '/dashboard' }];
