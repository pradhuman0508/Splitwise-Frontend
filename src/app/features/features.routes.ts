import { Routes } from '@angular/router';
import { groupMemberGuard } from '../core/guards/group-member.guard';
import { GroupExpensesComponent } from './groups/pages/group-expenses/group-expenses.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { AppLayout } from '../core/layout/app.layout';
import { ManageMembersComponent } from './groups/pages/manage-members/manage-members.component';
import { GroupComponent } from './groups/pages/group.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'groups', component: GroupListComponent },
      { path: 'group/:id', component: GroupComponent, canMatch: [groupMemberGuard], children: [
        { path: '', component: GroupExpensesComponent },
        { path: 'manage-members', component: ManageMembersComponent }
      ] }
    ]
  },
];
