import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { Empty } from './empty/empty.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: 'empty', component: Empty },
      { path: 'dashboard', component: DashboardComponent },
      // { path: 'friends', component: FriendListComponent },
      // { path: 'groups', component: GroupListComponent },
      // { path: 'expenses', component: ExpenseListComponent },
      // { path: 'balances', component: BalanceSummaryComponent },
      // { path: '', redirectTo: 'friends', pathMatch: 'full' }  // optional default route
    ]
  },
];
