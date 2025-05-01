import { Routes } from '@angular/router';

export const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
},
{
  path: 'pages',
  loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
},
{ path: '', redirectTo: '/pages', pathMatch: 'full' },
{ path: '**', redirectTo: '/pages' }];
