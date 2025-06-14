import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { Empty } from './empty/empty.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { authGuard } from '../core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: 'empty', component: Empty },
      { path: 'dashboard', component: DashboardComponent },
      // { path: 'friends', component: FriendListComponent },
      { path: 'groups', component: GroupListComponent },
      // { path: 'expenses', component: ExpenseListComponent },
      // { path: 'balances', component: BalanceSummaryComponent },
      // { path: '', redirectTo: 'friends', pathMatch: 'full' }  // optional default route
    ]
  },
];
