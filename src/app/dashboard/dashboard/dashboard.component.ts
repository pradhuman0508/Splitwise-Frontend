import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgApexchartsModule } from "ng-apexcharts";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit{
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

  constructor() {}

  ngOnInit(): void {}

  openNewGroupModal(): void {
    console.log("Opening new group modal");
  }

  openNewExpenseModal(): void {
    console.log("Opening new expense modal");
  }
}
