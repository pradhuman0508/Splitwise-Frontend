import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'friends',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/friends/friends-list/friends-list.component').then(m => m.FriendsListComponent),
      },
      {
        path: 'groups',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent),
      },
      {
        path: 'groups/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent),
      },
      {
        path: 'transactions',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/transactions/transactions/transactions.component').then(m => m.TransactionsComponent),
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
