import { Routes } from '@angular/router';
import { AppLayout } from '../layout/component/app.layout';
import { Empty } from './empty/empty.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from '../core/auth.guard';
import { GroupComponent } from './groups/group/group.component';
import { GroupExpensesComponent } from './groups/group/group-expenses/group-expenses.component';
import { GroupDetailComponent } from './groups/group-detail/group-detail.component';
import { GroupListComponent } from './groups/group/group-list/group-list.component';
import { ManageMembersComponent } from './groups/group/manage-members/manage-members.component';

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
      { path: 'group/:id', component: GroupComponent, children: [
        { path: '', component: GroupExpensesComponent },
        { path: 'manage-members', component: ManageMembersComponent }
      ] },
      { path: 'group-detail', component: GroupDetailComponent }
    ]
  },
];
