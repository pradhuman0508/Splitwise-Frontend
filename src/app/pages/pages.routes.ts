import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { Empty } from './empty/empty.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { authGuard } from '../core/auth.guard';
import { GroupExpensesComponent } from './groups/group-expenses/group-expenses.component';
import { GroupDetailComponent } from './groups/group-detail/group-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'empty', component: Empty },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'groups', component: GroupListComponent },
      { path: 'group/:id', component: GroupExpensesComponent },
      { path: 'group-detail', component: GroupDetailComponent }
    ]
  },
];
