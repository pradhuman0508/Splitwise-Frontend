import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../groups.service';
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
  group: any = null;
  showEditDialog: boolean = false;
  editedGroup: any = {};
  menuItems: MenuItem[] = [];
  activeTabIndex: number = 0;

  // Mock members data
  members: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.groupId = +params['id'];
      this.loadGroupDetails();
    });

    this.setupMenuItems();
}

  loadGroupDetails(): void {
    // In a real app, this would come from the service
    this.group = {
      id: this.groupId,
      name: 'Roommates',
      description: 'Expenses for our apartment',
      memberCount: 4,
      balance: 120,
      totalExpenses: 2450,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
      lastActivity: new Date('2023-06-15'),
      createdAt: new Date('2023-01-10')
    };

    // Mock members data
    this.members = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
        balance: 50
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        balance: -30
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        balance: 100
      },
      {
        id: 4,
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        balance: 0
      }
    ];

    this.editedGroup = { ...this.group };
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
