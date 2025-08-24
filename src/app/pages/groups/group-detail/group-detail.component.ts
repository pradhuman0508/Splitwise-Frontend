import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupsService, Group, GroupMember } from '../groups.service';
import { ExpensesService } from '../../expenses/expenses.service';
import { ExpenseListComponent } from '../../expenses/expense-list/expense-list.component';
import { GroupMemberComponent } from '../group-member/group-member.component';
import { AddExpenseComponent } from '../../expenses/add-expense/add-expense.component';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TabViewModule,
    AvatarModule,
    AvatarGroupModule,
    DialogModule,
    InputTextModule,
    TooltipModule,
    MenuModule,
    ExpenseListComponent,
    GroupMemberComponent,
    AddExpenseComponent
  ],
  templateUrl: './group-detail.component.html',
  styleUrl: './group-detail.component.scss'
})
export class GroupDetailComponent implements OnInit {
  groupId: number = 0;
  group: Group | null = null;
  showEditDialog: boolean = false;
  editedGroup: any = {};
  menuItems: MenuItem[] = [];
  activeTabIndex: number = 0;
  members: GroupMember[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = +params['id'];
      this.loadGroupData();
      this.setupMenuItems();
    });
  }

  private loadGroupData(): void {
    this.groupsService.getGroups().subscribe(groups => {
      this.group = groups.find(g => g.id === this.groupId) || null;
    });

    this.groupsService.getGroupMembers(this.groupId).subscribe(members => {
      this.members = members;
    });
  }

  private setupMenuItems(): void {
    this.menuItems = [
      {
        label: 'Edit Group',
        icon: 'pi pi-pencil',
        command: () => this.showEditDialog = true
      },
      {
        label: 'Delete Group',
        icon: 'pi pi-trash',
        command: () => this.deleteGroup()
      }
    ];
  }

  goBack(): void {
    this.router.navigate(['/groups']);
  }

  saveGroupChanges(): void {
    if (this.group && this.editedGroup.name) {
      this.groupsService.updateGroupNameLocally(this.groupId, this.editedGroup.name);
      this.groupsService.updateGroupDescriptionLocally(this.groupId, this.editedGroup.description || '');
      this.showEditDialog = false;
      this.loadGroupData();
    }
  }

  deleteGroup(): void {
    this.router.navigate(['/groups']);
  }

  addExpense(): void {
    this.router.navigate(['/expenses/add'], { queryParams: { groupId: this.groupId } });
  }

  settleUp(): void {
    console.log('Settle up functionality');
  }

  onExpenseAdded(): void {
    // Refresh group data when a new expense is added
    this.loadGroupData();
  }
}
