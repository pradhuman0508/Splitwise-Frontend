import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, CurrencyPipe } from "@angular/common";
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { PanelModule } from 'primeng/panel';
import { Group } from '../../../groups/services/groups.service';
import { Subscription } from 'rxjs';
import { getAuth, User } from '@angular/fire/auth';
import { ButtonModule } from 'primeng/button';
import { AddExpenseComponent } from '../../../add-expense/add-expense.component';
import { DashboardService } from '../../dashboard.service';
import { MemberInvolvement, MemberWithBreakdown } from '../../dashboard.util';
import { RouterModule } from '@angular/router';
import { SplitterModule } from 'primeng/splitter';
import { AvatarModule } from "primeng/avatar";
import { TagModule } from "primeng/tag";
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from "primeng/divider";

@Component({
  selector: 'app-overview',
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
    RouterModule,
    AvatarModule,
    TagModule,
    DataViewModule,
    DividerModule,
    ScrollPanelModule,
    CurrencyPipe
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnInit, OnDestroy {
  totalExpenses: number = 0;
  youAreOwed: number = 0;
  youOwe: number = 0;

  isLoading: boolean = true;
  groups: Group[] = [];
  transactions: any[] = [];
  friends: any[] = [];
  currentUser: User | null = null;

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
}
