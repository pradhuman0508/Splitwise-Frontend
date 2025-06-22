import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { CreateGroupComponent } from '../groups/create-group/create-group.component';
import { AddFriendComponent } from '../friends/add-friend/add-friend.component';
import { SkeletonModule } from 'primeng/skeleton';
import { GroupsService } from '../groups/groups.service';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TableModule,
    RouterOutlet,
    CommonModule,
    ChartModule,
    CreateGroupComponent,
    AddFriendComponent,
    FormsModule,
    SkeletonModule,
    CardModule,
    PanelModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  searchCategory: string = "all";
  searchQuery: string = "";
  searchResults: any[] = [];

  totalExpenses: number = 0;
  youAreOwed: number = 0;
  youOwe: number = 0;

  isLoading: boolean = true;
  isChartLoading: boolean = true;

  groups: any[] = [];
  transactions: any[] = [];
  friends: any[] = [];

  doughnutData: any;
  doughnutOptions: any;

  constructor(private groupsService: GroupsService) {
    // Initialize empty data structures
    this.initializeEmptyData();
  }

  private initializeEmptyData(): void {
    this.groups = [];
    this.transactions = [];
    this.friends = [];
  }

  async ngOnInit(): Promise<void> {
    try {
      // Load data asynchronously
      await Promise.all([
        this.loadOverviewData(),
        this.loadGroups(),
        this.loadFriends(),
        this.loadTransactions(),
        this.initializeChart()
      ]);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadOverviewData(): Promise<void> {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 100));
    this.totalExpenses = 1250;
    this.youAreOwed = 450;
    this.youOwe = 200;
  }

  private async loadGroups(): Promise<void> {
    // Simulate API call - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 100));
    this.groups = [
      {
        id: 1,
        name: "Roommates",
        memberCount: 4,
        balance: 120,
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=64"
      },
      {
        id: 2,
        name: "Trip to Paris",
        memberCount: 6,
        balance: -45,
        avatar: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=64"
      },
      {
        id: 3,
        name: "Office Lunch",
        memberCount: 8,
        balance: 25,
        avatar: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=64"
      },
      {
        id: 4,
        name: 'Book Club',
        memberCount: 5,
        balance: 15,
        avatar: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d'
      }
    ];
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

  private async initializeChart(): Promise<void> {
    // Load chart data asynchronously
    await new Promise(resolve => setTimeout(resolve, 100));

    this.doughnutData = {
      labels: ['Groceries', 'Rent', 'Utilities', 'Entertainment'],
      datasets: [
        {
          data: [44, 55, 13, 43],
          backgroundColor: [
            '#2563eb',
            '#22c55e',
            '#f59e0b',
            '#ef4444'
          ],
          hoverBackgroundColor: [
            '#1d4ed8',
            '#16a34a',
            '#d97706',
            '#dc2626'
          ]
        }
      ]
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };

    this.isChartLoading = false;
  }

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
    console.log("Opening new expense modal");
  }

  addNewFriend(): void {
    console.log("Opening add friend modal");
  }

  navigateToGroup(groupId: string | number): void {
    this.groupsService.navigateToGroup(groupId);
  }
}
