import { Component, OnInit, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { GroupsService, Group, Expense, GroupMember } from '../../features/groups/services/groups.service';
import { firstValueFrom } from 'rxjs';
import { getAuth, User } from '@angular/fire/auth';
import { ButtonModule } from 'primeng/button';
import { AddExpenseComponent } from '../../features/add-expense/add-expense.component';
import { AvatarModule } from "primeng/avatar";
import { TagModule } from "primeng/tag";
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from "primeng/divider";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    AddExpenseComponent,
    ReactiveFormsModule,
    SkeletonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    TagModule,
    DataViewModule,
    DividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  searchForm = new FormGroup({
    searchCategory: new FormControl('all'),
    searchQuery: new FormControl('')
  });
  searchResults: any[] = [];

  // Getters for easy access to form values
  get searchCategory() { return this.searchForm.get('searchCategory')?.value || 'all'; }
  get searchQuery() { return this.searchForm.get('searchQuery')?.value || ''; }

  totalExpenses: number = 0;
  youAreOwed: number = 0;
  youOwe: number = 0;

  isLoading: boolean = true;
  // Removed chart loading flag

  groups: Group[] = [];
  transactions: any[] = [];
  friends: any[] = [];
  currentUser: User | null = null;
  activityList = [
  {
    "userName": "Alice",
    "actionType": "ADD_EXPENSE",
    "expenseName": "Dinner at Pizzeria",
    "groupName": "Goa Trip",
    "description": "Alice added a new expense 'Dinner at Pizzeria' in group 'Goa Trip'.",
    "createdAt": "2025-10-04T09:30:00"
  },
  {
    "userName": "Bob",
    "actionType": "UPDATE_EXPENSE",
    "expenseName": "Dinner at Pizzeria",
    "groupName": "Goa Trip",
    "description": "Bob updated the expense 'Dinner at Pizzeria' amount from ₹1200 to ₹1500.",
    "createdAt": "2025-10-04T10:00:00"
  },
  {
    "userName": "Charlie",
    "actionType": "ADD_EXPENSE",
    "expenseName": "Cab Fare",
    "groupName": "Goa Trip",
    "description": "Charlie added a new expense 'Cab Fare' in group 'Goa Trip'.",
    "createdAt": "2025-10-04T10:45:00"
  },
  {
    "userName": "Alice",
    "actionType": "SETTLE_UP",
    "expenseName": null,
    "groupName": "Goa Trip",
    "description": "Alice settled up with Bob for ₹500 in group 'Goa Trip'.",
    "createdAt": "2025-10-04T11:10:00"
  },
  {
    "userName": "David",
    "actionType": "DELETE_EXPENSE",
    "expenseName": "Snacks",
    "groupName": "Flatmates",
    "description": "David deleted the expense 'Snacks' from group 'Flatmates'.",
    "createdAt": "2025-10-04T11:45:00"
  },
  {
    "userName": "Eve",
    "actionType": "ADD_GROUP",
    "expenseName": null,
    "groupName": "Office Team Lunch",
    "description": "Eve created a new group 'Office Team Lunch'.",
    "createdAt": "2025-10-04T12:15:00"
  },
  {
    "userName": "Eve",
    "actionType": "ADD_MEMBER",
    "expenseName": null,
    "groupName": "Office Team Lunch",
    "description": "Eve added Bob to group 'Office Team Lunch'.",
    "createdAt": "2025-10-04T12:20:00"
  },
  {
    "userName": "Bob",
    "actionType": "ADD_EXPENSE",
    "expenseName": "Restaurant Bill",
    "groupName": "Office Team Lunch",
    "description": "Bob added a new expense 'Restaurant Bill' in group 'Office Team Lunch'.",
    "createdAt": "2025-10-04T12:40:00"
  },
  {
    "userName": "Charlie",
    "actionType": "REMOVE_MEMBER",
    "expenseName": null,
    "groupName": "Flatmates",
    "description": "Charlie removed David from group 'Flatmates'.",
    "createdAt": "2025-10-04T13:05:00"
  },
  {
    "userName": "Alice",
    "actionType": "SETTLE_UP",
    "expenseName": null,
    "groupName": "Flatmates",
    "description": "Alice settled up with Charlie for ₹300 in group 'Flatmates'.",
    "createdAt": "2025-10-04T13:40:00"
  }
];


  // Removed chart data to optimize component

  constructor(
    private groupsService: GroupsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize empty data structures
    this.initializeEmptyData();
  }

  private initializeEmptyData(): void {
    this.groups = [];
    this.transactions = [];
    this.friends = [];
  }

  async ngOnInit(): Promise<void> {
    // Skip heavy operations during SSR
    if (!isPlatformBrowser(this.platformId)) {
      this.isLoading = false;
      return;
    }
    try {
      this.currentUser = getAuth().currentUser;
    } catch (error) {
      console.error('Error while fetching current user:', error);
    }
    try {
      // Load data asynchronously
      await Promise.all([
        this.loadGroups(),
        this.loadFriends(),
        this.loadTransactions(),
        // Charts removed
      ]);
      await this.analyzeUserInvolvement();
    } finally {
      this.isLoading = false;
    }
  }

  // Removed dummy overview data loader

  private async analyzeUserInvolvement(): Promise<void> {
    if (!this.currentUser || !this.groups || this.groups.length === 0) {
      console.log('[Dashboard] No current user or no groups to analyze');
      return;
    }

    const userUid = this.currentUser.uid;

    const perGroupDetails = await Promise.all(this.groups.map(async (group) => {
      const [expenses, members]: [Expense[], GroupMember[]] = await Promise.all([
        firstValueFrom(this.groupsService.getGroupExpenses(group.id)),
        firstValueFrom(this.groupsService.getGroupMembers(group.id))
      ]);

      let youOweTotal = 0;
      let youAreOwedTotal = 0;
      let expensesInvolved = 0;
      const youOweToMap = new Map<string, number>(); // counterpartyUid -> amount
      const youAreOwedFromMap = new Map<string, number>(); // counterpartyUid -> amount

      for (const expense of expenses) {
        const isPaidByYou = expense.paidByUid === userUid;
        const youOweInThisExpense = expense.owedBy.find(o => o.userUid === userUid)?.amount || 0;
        const othersOweYouInThisExpense = isPaidByYou
          ? expense.owedBy.filter(o => o.userUid !== userUid).reduce((sum, o) => sum + o.amount, 0)
          : 0;

        if (youOweInThisExpense > 0 || othersOweYouInThisExpense > 0 || isPaidByYou) {
          expensesInvolved += 1;
        }

        // Accumulate totals
        if (!isPaidByYou && youOweInThisExpense > 0) {
          youOweTotal += youOweInThisExpense;
          // You owe the payer
          const payerUid = expense.paidByUid;
          youOweToMap.set(payerUid, (youOweToMap.get(payerUid) || 0) + youOweInThisExpense);
        }
        if (isPaidByYou && othersOweYouInThisExpense > 0) {
          youAreOwedTotal += othersOweYouInThisExpense;
          // Others owe you
          for (const owed of expense.owedBy) {
            if (owed.userUid !== userUid) {
              youAreOwedFromMap.set(owed.userUid, (youAreOwedFromMap.get(owed.userUid) || 0) + owed.amount);
            }
          }
        }
      }

      const netBalance = youAreOwedTotal - youOweTotal;

      const uidToName = new Map(members.map(m => [m.uid, m.name] as [string, string]));
      const youOweTo = Array.from(youOweToMap.entries()).map(([uid, amount]) => ({
        uid,
        name: uidToName.get(uid) || uid,
        amount
      }));
      const youAreOwedFrom = Array.from(youAreOwedFromMap.entries()).map(([uid, amount]) => ({
        uid,
        name: uidToName.get(uid) || uid,
        amount
      }));

      return {
        groupId: group.id,
        groupName: group.name,
        involved: expensesInvolved > 0,
        expensesInvolved,
        youOwe: youOweTotal,
        youAreOwed: youAreOwedTotal,
        netBalance,
        youOweTo,
        youAreOwedFrom
      };
    }));

    // Console log the detailed involvement per group
    console.log('[Dashboard] Current user UID:', userUid);
    console.log('[Dashboard] User involvement per group (with member-to-member shares):', perGroupDetails);

    // Aggregate totals for dashboard
    const totalYouAreOwed = perGroupDetails.reduce((sum, g) => sum + g.youAreOwed, 0);
    const totalYouOwe = perGroupDetails.reduce((sum, g) => sum + g.youOwe, 0);
    const netTotal = totalYouAreOwed - totalYouOwe;

    this.youAreOwed = totalYouAreOwed;
    this.youOwe = totalYouOwe;
    this.totalExpenses = netTotal;
  }

  private async loadGroups(): Promise<void> {
    this.groups = await firstValueFrom(this.groupsService.getGroups());
  }

  private async loadFriends(): Promise<void> {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 100));
    this.friends = [
      {
        name: "Sarah Wilson",
        email: "sarah.w@example.com",
        balance: 150,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64"
      },
      {
        name: "Michael Chen",
        email: "m.chen@example.com",
        balance: -75,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64"
      },
      {
        name: "Emily Davis",
        email: "emily.d@example.com",
        balance: 50,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64"
      }
    ];
  }

  private async loadTransactions(): Promise<void> {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 100));
    this.transactions = [
      {
        date: new Date(),
        description: "Monthly Rent",
        group: "Roommates",
        amount: -800,
        status: "Settled"
      },
      {
        date: new Date(),
        description: "Grocery Shopping",
        group: "Roommates",
        amount: 120,
        status: "Pending"
      },
      {
        date: new Date(),
        description: "Utility Bills",
        group: "Roommates",
        amount: -65,
        status: "Pending"
      }
    ];
  }

  // Removed chart initialization to reduce overhead

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.searchResults = [];

    if (this.searchCategory === "all" || this.searchCategory === "friends") {
      this.searchResults.push(...this.friends
        .filter(friend => friend.name.toLowerCase().includes(query))
        .map(friend => ({ ...friend, type: "friend" })));
    }

    if (this.searchCategory === "all" || this.searchCategory === "groups") {
      this.searchResults.push(...this.groups
        .filter(group => group.name.toLowerCase().includes(query))
        .map(group => ({ ...group, type: "group" })));
    }

    if (this.searchCategory === "all" || this.searchCategory === "expenses") {
      this.searchResults.push(...this.transactions
        .filter(expense => expense.description.toLowerCase().includes(query))
        .map(expense => ({
          name: expense.description,
          type: "expense",
          balance: expense.amount,
          avatar: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=64"
        })));
    }
  }

  openNewExpenseModal(): void {
    // This method is now handled by the AddExpenseComponent
    // The button in the template will trigger the component's modal
    console.log("Add expense functionality is now handled by AddExpenseComponent");
  }

  addNewFriend(): void {
    console.log("Opening add friend modal");
  }

  navigateToGroup(groupId: string | number): void {
    this.groupsService.navigateToGroup(groupId);
  }

  onExpenseAdded(): void {
    // Refresh dashboard data when a new expense is added
    this.loadGroups();
    this.loadTransactions();
    // Totals recomputed in analyzeUserInvolvement
  }

  // Reset search form
  resetSearch(): void {
    this.searchForm.reset({
      searchCategory: 'all',
      searchQuery: ''
    });
    this.searchResults = [];
  }

  getActionColor(action: string): any {
    switch (action) {
      case 'ADD_EXPENSE': return 'success';
      case 'UPDATE_EXPENSE': return 'info';
      case 'DELETE_EXPENSE': return 'danger';
      case 'SETTLE_UP': return 'warning';
      default: return undefined;
    }
  }

  revertDelete(_t14: { userName: string; actionType: string; expenseName: string; groupName: string; description: string; createdAt: string; }|{ userName: string; actionType: string; expenseName: null; groupName: string; description: string; createdAt: string; }) {
throw new Error('Method not implemented.');
}
}
