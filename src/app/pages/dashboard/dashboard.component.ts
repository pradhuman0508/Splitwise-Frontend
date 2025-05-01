import { RouterOutlet } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { NgApexchartsModule } from "ng-apexcharts";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet,CommonModule,NgApexchartsModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})


export class DashboardComponent implements OnInit {
  searchCategory: string = "all";
  searchQuery: string = "";
  searchResults: any[] = [];

  totalExpenses: number = 1250;
  youAreOwed: number = 450;
  youOwe: number = 200;

  chartSeries: number[] = [44, 55, 13, 43];
  chartConfig: any = {
    type: "donut",
    height: 250
  };

  chartLabels: string[] = ["Groceries", "Rent", "Utilities", "Entertainment"];
  chartTheme: any = {
    monochrome: {
      enabled: true,
      color: "#2563eb"
    }
  };

  groups = [
    {
      name: "Roommates",
      memberCount: 4,
      balance: 120,
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61"
    },
    {
      name: "Trip to Paris",
      memberCount: 6,
      balance: -45,
      avatar: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a"
    },
    {
      name: "Office Lunch",
      memberCount: 8,
      balance: 25,
      avatar: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205"
    }
  ];

  transactions = [
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

  isDropdownOpen: boolean = false;
  friends = [
    {
      name: "Sarah Wilson",
      email: "sarah.w@example.com",
      balance: 150,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
    },
    {
      name: "Michael Chen",
      email: "m.chen@example.com",
      balance: -75,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
    },
    {
      name: "Emily Davis",
      email: "emily.d@example.com",
      balance: 50,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
    }
  ];

  constructor() {}

  ngOnInit(): void {}

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
          avatar: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c"
        })));
    }
  }

  openNewGroupModal(): void {
    console.log("Opening new group modal");
  }

  openNewExpenseModal(): void {
    console.log("Opening new expense modal");
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  addNewFriend(): void {
    console.log("Opening add friend modal");
  }
}
