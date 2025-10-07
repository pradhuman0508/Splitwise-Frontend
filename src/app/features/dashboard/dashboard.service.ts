import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, combineLatest, Subscription } from 'rxjs';
import { GroupsService, Group, Expense, GroupMember } from '../../features/groups/services/groups.service';
import { User } from '@angular/fire/auth';
import { DashboardUtil, GroupExpenseDetails, MemberInvolvement, MemberWithBreakdown } from './dashboard.util';

export interface DashboardData {
  groups: Group[];
  transactions: any[];
  friends: any[];
  memberInvolvements: MemberInvolvement[];
  membersYouOwe: MemberWithBreakdown[];
  membersWhoOweYou: MemberWithBreakdown[];
  totals: {
    totalExpenses: number;
    youAreOwed: number;
    youOwe: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private groupsService: GroupsService) {}

  /**
   * Process all groups and return detailed analysis
   */
  async processAllGroups(groups: Group[], userUid: string): Promise<GroupExpenseDetails[]> {
    return Promise.all(groups.map(async (group) => {
      const [expenses, members] = await Promise.all([
        firstValueFrom(this.groupsService.getGroupExpenses(group.id)),
        firstValueFrom(this.groupsService.getGroupMembers(group.id))
      ]);

      return DashboardUtil.processGroupExpenses(group, expenses, members, userUid);
    }));
  }

  /**
   * Load groups data
   */
  async loadGroups(currentUser?: User | null): Promise<Group[]> {
    // Reconcile invites for current user, then return only groups where the user belongs
    this.groupsService.reconcileNullUidsForCurrentUser();
    const all = await firstValueFrom(this.groupsService.getGroups());
    if (!currentUser) return all;
    return this.groupsService.getGroupsForUser(currentUser.uid, currentUser.email || null);
  }

  /**
   * Load friends data (mock implementation)
   */
  async loadFriends(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
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

  /**
   * Load transactions data (mock implementation)
   */
  async loadTransactions(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [
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

  /**
   * Analyze user involvement and return complete dashboard data
   */
  async analyzeUserInvolvement(groups: Group[], userUid: string): Promise<{
    memberInvolvements: MemberInvolvement[];
    membersYouOwe: MemberWithBreakdown[];
    membersWhoOweYou: MemberWithBreakdown[];
    totals: {
      totalExpenses: number;
      youAreOwed: number;
      youOwe: number;
    };
  }> {
    const perGroupDetails = await this.processAllGroups(groups, userUid);
    const totals = DashboardUtil.updateDashboardTotals(perGroupDetails);

    const memberAggregations = DashboardUtil.aggregateMemberInvolvements(perGroupDetails);
    const memberInvolvements = DashboardUtil.buildMemberInvolvements(memberAggregations);
    const { membersYouOwe, membersWhoOweYou } = DashboardUtil.separateMembersByNetAmount(memberAggregations);

    DashboardUtil.logAnalysisResults(perGroupDetails, memberAggregations, {
      youOwe: totals.totalYouOwe,
      youAreOwed: totals.totalYouAreOwed,
      netTotal: totals.netTotal
    });

    return {
      memberInvolvements,
      membersYouOwe,
      membersWhoOweYou,
      totals: {
        totalExpenses: totals.netTotal,
        youAreOwed: totals.totalYouAreOwed,
        youOwe: totals.totalYouOwe
      }
    };
  }

  /**
   * Setup reactive subscriptions for groups and expenses
   */
  setupReactiveSubscriptions(
    groups: Group[],
    onDataChange: () => void
  ): Subscription[] {
    const subscriptions: Subscription[] = [];

    // Subscribe to groups changes
    const groupsSub = this.groupsService.getGroups().subscribe(groups => {
      onDataChange();
    });
    subscriptions.push(groupsSub);

    // Subscribe to expense changes for all groups
    if (groups.length > 0) {
      const expenseObservables = groups.map(group =>
        this.groupsService.getGroupExpenses(group.id)
      );

      const expensesSub = combineLatest(expenseObservables).subscribe(() => {
        onDataChange();
      });
      subscriptions.push(expensesSub);
    }

    return subscriptions;
  }

  /**
   * Get groups observable
   */
  getGroupsObservable(): Observable<Group[]> {
    return this.groupsService.getGroups();
  }

  /**
   * Navigate to group
   */
  navigateToGroup(groupId: string | number): void {
    this.groupsService.navigateToGroup(groupId);
  }

  /**
   * Find group by name
   */
  findGroupByName(groups: Group[], groupName: string): Group | undefined {
    return groups.find(g => g.name === groupName);
  }
}
