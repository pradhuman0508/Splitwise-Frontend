import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Group, GroupMember, GroupsService } from '../groups.service';
import { ExpensesService } from '../../expenses/expenses.service';
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
import { ExpenseListComponent } from '../../expenses/expense-list/expense-list.component';
import { GroupMemberComponent } from '../group-member/group-member.component';

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
    GroupMemberComponent
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
      this.groupId = 1;
      // this.groupId = +params['id'];
      if (this.groupId) {
        this.loadGroupDetails();
        this.loadGroupMembers();
      }
    });

    this.setupMenuItems();
  }

  loadGroupDetails(): void {
    this.groupsService.getGroups().subscribe({
      next: (groups) => {
        const foundGroup = groups.find(g => g.id === this.groupId);
        if (foundGroup) {
          this.group = foundGroup;
          this.editedGroup = { ...foundGroup };
        } else {
          // Handle case when group is not found
          console.error('Group not found');
          this.router.navigate(['/groups']);
        }
      },
      error: (error) => {
        console.error('Error loading group details:', error);
        // Handle error appropriately
      }
    });
  }

  loadGroupMembers(): void {
    if (!this.groupId) return;
    
    this.groupsService.getGroupMembers(this.groupId).subscribe({
      next: (members) => {
        this.members = members;
      },
      error: (error) => {
        console.error('Error loading group members:', error);
        this.members = [];
      }
    });
  }

  setupMenuItems(): void {
    this.menuItems = [
      {
        label: 'Edit Group',
        icon: 'pi pi-pencil',
        command: () => this.openEditDialog()
      },
      {
        label: 'Add Member',
        icon: 'pi pi-user-plus',
        command: () => this.addMember()
      },
      {
        label: 'Leave Group',
        icon: 'pi pi-sign-out',
        command: () => this.leaveGroup()
      },
      {
        separator: true
      },
      {
        label: 'Delete Group',
        icon: 'pi pi-trash',
        command: () => this.deleteGroup()
      }
    ];
  }

  openEditDialog(): void {
    this.editedGroup = { ...this.group };
    this.showEditDialog = true;
  }

  saveGroupChanges(): void {
    // In a real app, this would call the service
    this.group = { ...this.editedGroup };
    this.showEditDialog = false;
    // Show success message
  }

  addMember(): void {
    // Navigate to add member page or open dialog
    console.log('Add member functionality');
  }

  leaveGroup(): void {
    // Confirmation dialog would be shown in real app
    console.log('Leave group functionality');
  }

  deleteGroup(): void {
    // Confirmation dialog would be shown in real app
    console.log('Delete group functionality');
    this.router.navigate(['/groups']);
  }

  addExpense(): void {
    this.router.navigate(['/expenses/add'], { queryParams: { groupId: this.groupId } });
  }

  settleUp(): void {
    console.log('Settle up functionality');
    // Open settle up dialog
  }

  goBack(): void {
    this.router.navigate(['/groups']);
  }
}
