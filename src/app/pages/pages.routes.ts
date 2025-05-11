import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { AppLayout } from '../layout/component/app.layout';
import { Empty } from './empty/empty.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: 'empty', component: Empty },
      { path: '', component: DashboardComponent },
      // { path: 'friends', component: FriendListComponent },
      // { path: 'groups', component: GroupListComponent },
      // { path: 'expenses', component: ExpenseListComponent },
      // { path: 'balances', component: BalanceSummaryComponent },
      // { path: '', redirectTo: 'friends', pathMatch: 'full' }  // optional default route
    ]
  },
  { path: 'landing', component: LandingComponent }
];
