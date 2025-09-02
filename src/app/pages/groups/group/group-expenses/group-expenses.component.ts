import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { GroupComponent } from '../group.component';
import { AddExpenseComponent } from '../../../expenses/add-expense/add-expense.component';

@Component({
  selector: 'app-group-expenses',
  standalone: true,
  imports: [ScrollPanelModule, CardModule, TagModule, CommonModule, AddExpenseComponent],
  templateUrl: './group-expenses.component.html',
  styleUrls: ['../group.component.scss']
})
export class GroupExpensesComponent {
  private readonly parentGroupComponent = inject(GroupComponent);

  get groupedExpenses() {
    return this.parentGroupComponent.groupedExpenses;
  }

  get groupId() {
    return this.parentGroupComponent.groupId;
  }

  onExpenseAdded(): void {
    this.parentGroupComponent.loadGroupData();
  }
}
