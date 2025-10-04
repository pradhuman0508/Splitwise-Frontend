import { Group, Expense, GroupMember } from '../../features/groups/services/groups.service';

// Type definitions for utility functions
export interface GroupExpenseDetails {
  groupId: string;
  groupName: string;
  involved: boolean;
  expensesInvolved: number;
  youOwe: number;
  youAreOwed: number;
  netBalance: number;
  youOweTo: MemberAmount[];
  youAreOwedFrom: MemberAmount[];
}

export interface MemberAmount {
  uid: string;
  name: string;
  amount: number;
  avatar: string;
}

export interface MemberInvolvement {
  memberName: string;
  groupNames: string[];
  totalYouAreOwed: number;
  totalYouOwe: number;
}

export interface MemberWithBreakdown {
  memberName: string;
  groupNames: string[];
  amount: number;
  groupBreakdown: GroupBreakdown[];
  avatar: string;
}

export interface GroupBreakdown {
  groupName: string;
  amount: number;
}

export interface MemberAggregation {
  memberName: string;
  groupNames: Set<string>;
  totalYouAreOwed: number;
  totalYouOwe: number;
  groupBreakdown: Map<string, { youAreOwed: number; youOwe: number }>;
  avatar: string;
}

export interface ExpenseAnalysis {
  isPaidByYou: boolean;
  youOwe: number;
  youAreOwed: number;
  isInvolved: boolean;
  payerUid: string;
  owedByOthers: { userUid: string; amount: number }[];
}

export class DashboardUtil {
  /**
   * Process expenses for a single group
   */
  static processGroupExpenses(
    group: Group, 
    expenses: Expense[], 
    members: GroupMember[], 
    userUid: string
  ): GroupExpenseDetails {
    const youOweToMap = new Map<string, number>();
    const youAreOwedFromMap = new Map<string, number>();
    let youOweTotal = 0;
    let youAreOwedTotal = 0;
    let expensesInvolved = 0;

    for (const expense of expenses) {
      const expenseAnalysis = this.analyzeExpense(expense, userUid);
      
      if (expenseAnalysis.isInvolved) {
        expensesInvolved++;
      }

      this.accumulateExpenseAmounts(expenseAnalysis, youOweToMap, youAreOwedFromMap);
      youOweTotal += expenseAnalysis.youOwe;
      youAreOwedTotal += expenseAnalysis.youAreOwed;
    }

    const uidToName = new Map(members.map(m => [m.uid, m.name] as [string, string]));
    const uidToAvatar = new Map(members.map(m => [m.uid, m.avatar] as [string, string]));
    
    return {
      groupId: group.id.toString(),
      groupName: group.name,
      involved: expensesInvolved > 0,
      expensesInvolved,
      youOwe: youOweTotal,
      youAreOwed: youAreOwedTotal,
      netBalance: youAreOwedTotal - youOweTotal,
      youOweTo: this.mapToMemberAmounts(youOweToMap, uidToName, uidToAvatar),
      youAreOwedFrom: this.mapToMemberAmounts(youAreOwedFromMap, uidToName, uidToAvatar)
    };
  }

  /**
   * Analyze a single expense
   */
  static analyzeExpense(expense: Expense, userUid: string): ExpenseAnalysis {
    const isPaidByYou = expense.paidByUid === userUid;
    const youOweInThisExpense = expense.owedBy.find(o => o.userUid === userUid)?.amount || 0;
    const othersOweYouInThisExpense = isPaidByYou
      ? expense.owedBy.filter(o => o.userUid !== userUid).reduce((sum, o) => sum + o.amount, 0)
      : 0;

    return {
      isPaidByYou,
      youOwe: !isPaidByYou ? youOweInThisExpense : 0,
      youAreOwed: isPaidByYou ? othersOweYouInThisExpense : 0,
      isInvolved: youOweInThisExpense > 0 || othersOweYouInThisExpense > 0 || isPaidByYou,
      payerUid: expense.paidByUid,
      owedByOthers: expense.owedBy.filter(o => o.userUid !== userUid)
    };
  }

  /**
   * Accumulate amounts from expense analysis
   */
  static accumulateExpenseAmounts(
    analysis: ExpenseAnalysis,
    youOweToMap: Map<string, number>,
    youAreOwedFromMap: Map<string, number>
  ): void {
    if (analysis.youOwe > 0) {
      const currentAmount = youOweToMap.get(analysis.payerUid) || 0;
      youOweToMap.set(analysis.payerUid, currentAmount + analysis.youOwe);
    }

    if (analysis.youAreOwed > 0) {
      for (const owed of analysis.owedByOthers) {
        const currentAmount = youAreOwedFromMap.get(owed.userUid) || 0;
        youAreOwedFromMap.set(owed.userUid, currentAmount + owed.amount);
      }
    }
  }

  /**
   * Convert maps to member amount arrays
   */
  static mapToMemberAmounts(
    amountMap: Map<string, number>, 
    uidToName: Map<string, string>,
    uidToAvatar: Map<string, string>
  ): MemberAmount[] {
    return Array.from(amountMap.entries()).map(([uid, amount]) => ({
      uid,
      name: uidToName.get(uid) || uid,
      amount,
      avatar: uidToAvatar.get(uid) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64'
    }));
  }

  /**
   * Update dashboard totals
   */
  static updateDashboardTotals(perGroupDetails: GroupExpenseDetails[]): {
    totalYouAreOwed: number;
    totalYouOwe: number;
    netTotal: number;
  } {
    const totalYouAreOwed = perGroupDetails.reduce((sum, g) => sum + g.youAreOwed, 0);
    const totalYouOwe = perGroupDetails.reduce((sum, g) => sum + g.youOwe, 0);
    const netTotal = totalYouAreOwed - totalYouOwe;

    return {
      totalYouAreOwed,
      totalYouOwe,
      netTotal
    };
  }

  /**
   * Aggregate member involvements across all groups
   */
  static aggregateMemberInvolvements(perGroupDetails: GroupExpenseDetails[]): Map<string, MemberAggregation> {
    const involvementByUid = new Map<string, MemberAggregation>();

    for (const group of perGroupDetails) {
      this.aggregateGroupMembers(group, involvementByUid);
    }

    return involvementByUid;
  }

  /**
   * Aggregate members for a single group
   */
  static aggregateGroupMembers(
    group: GroupExpenseDetails, 
    involvementByUid: Map<string, MemberAggregation>
  ): void {
    this.aggregateMemberAmounts(group.youOweTo, group.groupName, involvementByUid, 'youOwe');
    this.aggregateMemberAmounts(group.youAreOwedFrom, group.groupName, involvementByUid, 'youAreOwed');
  }

  /**
   * Aggregate member amounts by type
   */
  static aggregateMemberAmounts(
    memberAmounts: MemberAmount[],
    groupName: string,
    involvementByUid: Map<string, MemberAggregation>,
    type: 'youOwe' | 'youAreOwed'
  ): void {
    for (const member of memberAmounts) {
      const key = member.uid;
      
      if (!involvementByUid.has(key)) {
        involvementByUid.set(key, {
          memberName: member.name,
          groupNames: new Set<string>(),
          totalYouAreOwed: 0,
          totalYouOwe: 0,
          groupBreakdown: new Map(),
          avatar: member.avatar
        });
      }

      const aggregation = involvementByUid.get(key)!;
      aggregation.groupNames.add(groupName);
      aggregation[type === 'youOwe' ? 'totalYouOwe' : 'totalYouAreOwed'] += member.amount;

      if (!aggregation.groupBreakdown.has(groupName)) {
        aggregation.groupBreakdown.set(groupName, { youAreOwed: 0, youOwe: 0 });
      }
      
      const groupAmounts = aggregation.groupBreakdown.get(groupName)!;
      groupAmounts[type === 'youOwe' ? 'youOwe' : 'youAreOwed'] += member.amount;
    }
  }

  /**
   * Build member involvements array
   */
  static buildMemberInvolvements(memberAggregations: Map<string, MemberAggregation>): MemberInvolvement[] {
    return Array.from(memberAggregations.values())
      .map(v => ({
        memberName: v.memberName,
        groupNames: Array.from(v.groupNames).sort(),
        totalYouAreOwed: v.totalYouAreOwed,
        totalYouOwe: v.totalYouOwe
      }))
      .sort((a, b) => a.memberName.localeCompare(b.memberName));
  }

  /**
   * Separate members by net amount
   */
  static separateMembersByNetAmount(memberAggregations: Map<string, MemberAggregation>): {
    membersYouOwe: MemberWithBreakdown[];
    membersWhoOweYou: MemberWithBreakdown[];
  } {
    const membersYouOwe: MemberWithBreakdown[] = [];
    const membersWhoOweYou: MemberWithBreakdown[] = [];

    for (const member of memberAggregations.values()) {
      const netAmount = member.totalYouAreOwed - member.totalYouOwe;
      const groupBreakdown = this.calculateGroupBreakdown(member.groupBreakdown);

      if (netAmount > 0) {
        membersWhoOweYou.push({
          memberName: member.memberName,
          groupNames: Array.from(member.groupNames).sort(),
          amount: netAmount,
          groupBreakdown,
          avatar: member.avatar
        });
      } else if (netAmount < 0) {
        membersYouOwe.push({
          memberName: member.memberName,
          groupNames: Array.from(member.groupNames).sort(),
          amount: Math.abs(netAmount),
          groupBreakdown,
          avatar: member.avatar
        });
      }
    }

    membersYouOwe.sort((a, b) => a.memberName.localeCompare(b.memberName));
    membersWhoOweYou.sort((a, b) => a.memberName.localeCompare(b.memberName));

    return { membersYouOwe, membersWhoOweYou };
  }

  /**
   * Calculate group breakdown for a member
   */
  static calculateGroupBreakdown(
    groupBreakdown: Map<string, { youAreOwed: number; youOwe: number }>
  ): GroupBreakdown[] {
    return Array.from(groupBreakdown.entries())
      .map(([groupName, amounts]) => ({
        groupName,
        amount: amounts.youAreOwed - amounts.youOwe
      }))
      .filter(gb => gb.amount !== 0);
  }

  /**
   * Log analysis results (minimal logging)
   */
  static logAnalysisResults(
    perGroupDetails: GroupExpenseDetails[], 
    memberAggregations: Map<string, MemberAggregation>,
    totals: { youOwe: number; youAreOwed: number; netTotal: number }
  ): void {
    console.log('[Dashboard] Analysis complete:', {
      groupsProcessed: perGroupDetails.length,
      membersInvolved: memberAggregations.size,
      youOwe: totals.youOwe,
      youAreOwed: totals.youAreOwed,
      netTotal: totals.netTotal
    });
  }
}
