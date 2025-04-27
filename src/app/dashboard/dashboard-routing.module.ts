import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FriendListComponent } from './friends/friend-list/friend-list.component';
import { GroupListComponent } from './groups/group-list/group-list.component';
import { ExpenseListComponent } from './expenses/expense-list/expense-list.component';
import { BalanceSummaryComponent } from './balances/balance-summary/balance-summary.component';

const routes: Routes = [ {
  path: '',
  component: DashboardComponent,   // Shell layout
  children: [
    { path: 'friends', component: FriendListComponent },
    { path: 'groups', component: GroupListComponent },
    { path: 'expenses', component: ExpenseListComponent },
    { path: 'balances', component: BalanceSummaryComponent },
    // { path: '', redirectTo: 'friends', pathMatch: 'full' }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
