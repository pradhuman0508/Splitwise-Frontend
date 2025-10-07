import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { Group } from '../../features/groups/services/groups.service';
import { Subscription } from 'rxjs';
import { getAuth, User } from '@angular/fire/auth';
import { ButtonModule } from 'primeng/button';
import { AddExpenseComponent } from '../../features/add-expense/add-expense.component';
import { DashboardService } from './dashboard.service';
import { MemberInvolvement, MemberWithBreakdown } from './dashboard.util';
import { RouterModule, RouterLink } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';
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
    SplitterModule,
    PanelModule,
    RouterLink,
    RouterModule,
    AvatarModule,
    TagModule,
    DataViewModule,
    DividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
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


  // Aggregated member involvement across groups for the current user
  memberInvolvements: MemberInvolvement[] = [];

  // Separated data for display based on net amount logic
  membersYouOwe: MemberWithBreakdown[] = [];
  membersWhoOweYou: MemberWithBreakdown[] = [];

  private isAnalyzing = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeEmptyData();
  }

  private initializeEmptyData(): void {
    this.groups = [];
    this.transactions = [];
    this.friends = [];
  }

  async ngOnInit(): Promise<void> {
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
      await Promise.all([
        this.loadGroups(),
        this.loadFriends(),
        this.loadTransactions(),
      ]);

      this.setupReactiveSubscriptions();
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async analyzeUserInvolvement(): Promise<void> {
    if (this.isAnalyzing || !this.currentUser || !this.groups?.length) {
      return;
    }

    this.isAnalyzing = true;

    try {
      const analysisResult = await this.dashboardService.analyzeUserInvolvement(
        this.groups,
        this.currentUser.uid
      );

      // Update component properties with analysis results
      this.memberInvolvements = analysisResult.memberInvolvements;
      this.membersYouOwe = analysisResult.membersYouOwe;
      this.membersWhoOweYou = analysisResult.membersWhoOweYou;

      // Update totals
      this.totalExpenses = analysisResult.totals.totalExpenses;
      this.youAreOwed = analysisResult.totals.youAreOwed;
      this.youOwe = analysisResult.totals.youOwe;
    } finally {
      this.isAnalyzing = false;
    }
  }

  // Data loading methods - now delegate to service
  private async loadGroups(): Promise<void> {
    this.groups = await this.dashboardService.loadGroups(this.currentUser);
  }

  private setupReactiveSubscriptions(): void {
    this.subscriptions = this.dashboardService.setupReactiveSubscriptions(
      this.groups,
      () => this.analyzeUserInvolvement()
    );
  }

  private async loadFriends(): Promise<void> {
    this.friends = await this.dashboardService.loadFriends();
  }

  private async loadTransactions(): Promise<void> {
    this.transactions = await this.dashboardService.loadTransactions();
  }

  // UI interaction methods
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

  navigateToGroup(groupId: string | number): void {
    this.dashboardService.navigateToGroup(groupId);
  }

  navigateToGroupByName(groupName: string): void {
    const group = this.dashboardService.findGroupByName(this.groups, groupName);
    if (group) {
      this.navigateToGroup(group.id);
    } else {
      console.warn(`Group not found: ${groupName}`);
    }
  }

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
