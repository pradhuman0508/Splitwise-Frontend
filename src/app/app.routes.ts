import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes)
  },
  {
    path: '',
    loadChildren: () => import('./features/features.routes').then(m => m.routes),
    canMatch: [authGuard]
  },
  { path: '**', redirectTo: '' }];
