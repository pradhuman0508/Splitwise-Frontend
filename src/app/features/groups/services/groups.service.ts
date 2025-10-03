import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { getAuth, User } from '@angular/fire/auth';
import { catchError, map } from 'rxjs/operators';

export interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  balance: number;
  totalExpenses: number;
  avatar: string;
  createdAt: Date;
}

export interface GroupMember {
  id: number;
  uid: string; // Firebase UID for unique identification
  name: string;
  email: string;
  avatar: string;
  balance: number;
  owesTo: { name: string; amount: number }[];
  owedBy: { name: string; amount: number }[];
  createdAt: Date;
  involved?: boolean; // Optional property for expense involvement
}

export interface Expense {
  expenseId: string;
  description: string;
  amount: number;
  currency: string;
  addedByUid: string;        // Just the UID
  paidByUid: string;         // Just the UID
  addedAt: Date;
  updatedAt: Date;
  receiptImageUrl: string | null;
  owedBy: { userUid: string; amount: number }[];  // Just UIDs
}

export interface ExpenseWithMembers {
  expenseId: string;
  description: string;
  amount: number;
  currency: string;
  addedBy: GroupMember | undefined;
  paidBy: GroupMember | undefined;
  addedAt: Date;
  updatedAt: Date;
  receiptImageUrl: string | null;
  owedBy: { user: GroupMember | undefined; amount: number }[];
}

export interface GroupedExpenses {
  month: string;
  expenses: Expense[];
}

export interface GroupedExpensesWithMembers {
  month: string;
  expenses: ExpenseWithMembers[];
}

// UID Resolution Interfaces
export interface UidResolutionResult {
  success: boolean;
  uid?: string;
  error?: string;
  source: 'current-user' | 'backend-api' | 'signin-methods' | 'not-found';
}

export interface BackendApiResponse {
  success: boolean;
  uid?: string;
  email?: string;
  displayName?: string;
  emailVerified?: boolean;
  createdAt?: string;
  error?: string;
  message?: string;
}

export interface UserLookupResult {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
}

interface GroupAvatarResponse {
  avatarUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private groups: Group[] = [
    {
      id: 1,
      name: 'Roommates',
      description: 'Expenses for our apartment',
      memberCount: 4,
      balance: 0,
      totalExpenses: 0,
      avatar: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
      createdAt: new Date('2023-06-15')
    },
    {
      id: 2,
      name: 'APY Transactions',
      description: 'Our amazing vacation',
      memberCount: 6,
      balance: 0,
      totalExpenses: 0,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
      createdAt: new Date('2023-05-20')
    },
    {
      id: 3,
      name: 'Office Lunch',
      description: 'Weekly team lunches',
      memberCount: 8,
      balance: 0,
      totalExpenses: 0,
      avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
      createdAt: new Date('2023-06-10')
    },
    {
      id: 4,
      name: 'Book Club',
      description: 'Monthly book purchases and snacks',
      memberCount: 5,
      balance: 0,
      totalExpenses: 0,
      avatar: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
      createdAt: new Date('2023-06-01')
    }
  ];

  private groupMembers: { [groupId: number]: GroupMember[] } = {
    1: [
      {
        "id": 1,
        "uid": "SVDRpbKNM1VTqkuov5cnbM0bkpr1",
        "name": "Yash Bakadiya",
        "email": "bakadiyayash@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
        "balance": 50,
        "owesTo": [],
        "owedBy": [
          { "name": "Pradhuman Vaidya", "amount": 30 },
          { "name": "Yash 0098209295", "amount": 20 }
        ],
        "createdAt": new Date('2024-01-15')
      },
      {
        "id": 2,
        "uid": "hDoEcQAufdZbNstzz0SjAsRnCzG2",
        "name": "Pradhuman Vaidya",
        "email": "pradhumanvaidya612@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        "balance": -30,
        "owesTo": [
          { "name": "Yash Bakadiya", "amount": 30 }
        ],
        "owedBy": [],
        "createdAt": new Date('2024-01-16')
      },
      {
        "id": 3,
        "uid": "TcW3Byi7dlXZbNUj1GQeroA6tPU2",
        "name": "Test User",
        "email": "test@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
        "balance": -80,
        "owesTo": [
          { "name": "Yash 0098209295", "amount": 80 }
        ],
        "owedBy": [],
        "createdAt": new Date('2024-01-17')
      },
      {
        "id": 4,
        "uid": "DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1",
        "name": "Clone Splitwise",
        "email": "clonesplitwise@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        "balance": -80,
        "owesTo": [
          { "name": "Yash 0098209295", "amount": 80 }
        ],
        "owedBy": [],
        "createdAt": new Date('2024-01-18')
      },
      {
        "id": 5,
        "uid": "JVSdnKLZPyVisgcEI7seSKlsBv02",
        "name": "Yash 0098209295",
        "email": "yash0098209295@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "balance": 140,
        "owesTo": [
          { "name": "Yash Bakadiya", "amount": 20 }
        ],
        "owedBy": [
          { "name": "Test User", "amount": 80 },
          { "name": "Clone Splitwise", "amount": 80 }
        ],
        "createdAt": new Date('2024-01-19')
      },
      {
        "id": 6,
        "uid": "Nx1feK6Wn9Z61d5pzs9XP0NzVBx1",
        "name": "Ashwin",
        "email": "qq@dd.cc",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
        "balance": 0,
        "owesTo": [],
        "owedBy": [],
        "createdAt": new Date('2023-02-21')
      },
      {
        "id": 7,
        "uid": "firebase-uid-christopher-campbell",
        "name": "Christopher Campbell",
        "email": "ChristopherCampbell@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        "balance": -180,
        "owesTo": [
          { "name": "Hlove", "amount": 180 }
        ],
        "owedBy": [],
        "createdAt": new Date('2023-01-10')
      },
      {
        "id": 8,
        "uid": "firebase-uid-hlove",
        "name": "Hlove",
        "email": "hlovesplit@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        "balance": -50,
        "owesTo": [
          { "name": "Clone Splitwise", "amount": 50 }
        ],
        "owedBy": [],
        "createdAt": new Date('2024-03-11')
      }
    ],
    2: [
      {
        "id": 1,
        "uid": "SVDRpbKNM1VTqkuov5cnbM0bkpr1",
        "name": "Yash Bakadiya",
        "email": "bakadiyayash@gmail.com",
        "avatar": "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
        "balance": 50,
        "owesTo": [],
        "owedBy": [
          { "name": "Akshay Shinde", "amount": 48000 }
        ],
        "createdAt": new Date('2024-01-15')
      },
      {
        "id": 2,
        "uid": "hDoEcQAufdZbNstzz0SjAsRnCzG2",
        "name": "Pradhuman Vaidya",
        "email": "pradhumanvaidya612@gmail.com",
        "avatar": "https://i.pravatar.cc/150?img=12",
        "balance": 0,
        "owesTo": [],
        "owedBy": [],
        "createdAt": new Date('2024-01-16')
      },
      {
        "id": 3,
        "uid": "TYjZMWaj09clFIocVywb4WWHYmW2",
        "name": "Akshay Shinde",
        "email": "akshay.shinde@gmail.com",
        "avatar": "https://i.pravatar.cc/150?img=11",
        "balance": -30,
        "owesTo": [
          { "name": "Yash Bakadiya", "amount": 48000 }
        ],
        "owedBy": [],
        "createdAt": new Date('2024-01-16')
      }
    ]
  };

  private groupExpenses: { [groupId: number]: Expense[] } = {
    1: [
      {
        expenseId: 'e201',
        description: 'Dinner at Fisherman\'s Wharf',
        amount: 3500,
        currency: 'INR',
        addedByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        paidByUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2',
        addedAt: new Date('2025-09-15T19:30:00Z'),
        updatedAt: new Date('2025-09-16T09:10:00Z'),
        receiptImageUrl: 'https://cdn.vertex42.com/ExcelTemplates/Images/invoices/blank-invoice-template.png',
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 875 },
          { userUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2', amount: 875 },
          { userUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2', amount: 875 },
          { userUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1', amount: 875 }
        ]
      },
      {
        expenseId: 'e202',
        description: 'Taxi from Airport to Hotel',
        amount: 1200,
        currency: 'INR',
        addedByUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2',
        paidByUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2',
        addedAt: new Date('2025-09-14T14:15:00Z'),
        updatedAt: new Date('2025-09-14T14:15:00Z'),
        receiptImageUrl: null,
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 300 },
          { userUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2', amount: 300 },
          { userUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2', amount: 300 },
          { userUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1', amount: 300 }
        ]
      },
      {
        expenseId: 'e203',
        description: 'Hotel Room Booking',
        amount: 8000,
        currency: 'INR',
        addedByUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1',
        paidByUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1',
        addedAt: new Date('2025-09-13T10:00:00Z'),
        updatedAt: new Date('2025-09-13T10:00:00Z'),
        receiptImageUrl: 'https://cdn.vectorstock.com/i/1000v/30/08/receipt-bill-paper-invoicereceipt-template-vector-37033008.jpg',
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 2000 },
          { userUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2', amount: 2000 },
          { userUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2', amount: 2000 },
          { userUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1', amount: 2000 }
        ]
      },
      {
        expenseId: 'e204',
        description: 'Beach Activities',
        amount: 2400,
        currency: 'INR',
        addedByUid: 'JVSdnKLZPyVisgcEI7seSKlsBv02',
        paidByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        addedAt: new Date('2025-09-16T16:45:00Z'),
        updatedAt: new Date('2025-09-16T16:45:00Z'),
        receiptImageUrl: null,
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 600 },
          { userUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2', amount: 600 },
          { userUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2', amount: 600 },
          { userUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1', amount: 600 }
        ]
      },
      {
        expenseId: 'e205',
        description: 'Dinner at Fisherman\'s Wharf',
        amount: 3500,
        currency: 'INR',
        addedByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        paidByUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2',
        addedAt: new Date('2025-09-19T19:30:00Z'),
        updatedAt: new Date('2025-09-19T09:10:00Z'),
        receiptImageUrl: 'https://cdn.vertex42.com/ExcelTemplates/Images/invoices/blank-invoice-template.png',
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 875 },
          { userUid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2', amount: 875 },
          { userUid: 'TcW3Byi7dlXZbNUj1GQeroA6tPU2', amount: 875 },
          { userUid: 'DlmQ8eAeCFP36SQ1NZvZwG6V3Bt1', amount: 875 }
        ]
      }
    ],
    2: [
      {
        expenseId: 'e101',
        description: 'Other amount remaining',
        amount: 23000,
        currency: 'INR',
        addedByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        paidByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        addedAt: new Date('2025-09-15T19:30:00Z'),
        updatedAt: new Date('2025-09-16T09:10:00Z'),
        receiptImageUrl: 'https://cdn.vertex42.com/ExcelTemplates/Images/invoices/blank-invoice-template.png',
        owedBy: [
          { userUid: 'TYjZMWaj09clFIocVywb4WWHYmW2', amount: 23000 }
        ]
      },
      {
        expenseId: 'e102',
        description: 'credit card remaining',
        amount: 25000,
        currency: 'INR',
        addedByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        paidByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        addedAt: new Date('2025-09-14T14:15:00Z'),
        updatedAt: new Date('2025-09-14T14:15:00Z'),
        receiptImageUrl: null,
        owedBy: [
          { userUid: 'TYjZMWaj09clFIocVywb4WWHYmW2', amount: 25000 }
        ]
      }
    ]
  };

  private groupsSubject = new BehaviorSubject<Group[]>(this.groups);

  private apiUrl = 'http://localhost:3001/api'; // Backend API URL

  constructor(
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getGroups(): Observable<Group[]> {
    return this.groupsSubject.asObservable();
  }

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    return of(this.groupMembers[groupId] || []);
  }

  removeGroupMemberLocally(groupId: number, memberId: number): void {
    const members = this.groupMembers[groupId] || [];
    this.groupMembers[groupId] = members.filter(m => m.id !== memberId);
  }

  getGroupExpenses(groupId: number): Observable<Expense[]> {
    return of(this.groupExpenses[groupId] || []);
  }

  getGroupedExpenses(groupId: number): Observable<GroupedExpenses[]> {
    const expenses = this.groupExpenses[groupId] || [];
    // Key by YYYY-MM for stable sorting, store display label separately
    const grouped = new Map<string, { label: string; expenses: Expense[] }>();

    expenses.forEach(expense => {
      const year = expense.addedAt.getFullYear();
      const monthIndex = expense.addedAt.getMonth() + 1; // 1-12
      const key = `${year}-${String(monthIndex).padStart(2, '0')}`;
      const label = expense.addedAt.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped.has(key)) {
        grouped.set(key, { label, expenses: [] });
      }
      grouped.get(key)!.expenses.push(expense);
    });

    const groupedExpenses = Array.from(grouped.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // sort by YYYY-MM desc
      .map(([_, value]) => ({
        month: value.label,
        expenses: value.expenses.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      }));

    return of(groupedExpenses);
  }

  addGroup(group: Group): void {
    this.groups = [...this.groups, group];
    this.groupsSubject.next(this.groups);
  }

  getNextId(): number {
    return Math.max(...this.groups.map(g => g.id), 0) + 1;
  }

  navigateToGroup(groupId: string | number): void {
    this.router.navigate(['/group', groupId]);
  }

  updateGroupAvatar(groupId: string, formData: FormData): Observable<GroupAvatarResponse> {
    return this.http.put<GroupAvatarResponse>(`${this.apiUrl}/groups/${groupId}/avatar`, formData);
  }

  updateGroupAvatarLocally(groupId: number, avatarUrl: string): void {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      this.groups[groupIndex] = {
        ...this.groups[groupIndex],
        avatar: avatarUrl
      };
      this.groupsSubject.next([...this.groups]);
    }
  }

  updateGroupNameLocally(groupId: number, newName: string): void {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      this.groups[groupIndex] = {
        ...this.groups[groupIndex],
        name: newName
      };
      this.groupsSubject.next([...this.groups]);
    }
  }

  updateGroupDescriptionLocally(groupId: number, newDescription: string): void {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      this.groups[groupIndex] = {
        ...this.groups[groupIndex],
        description: newDescription
      };
      this.groupsSubject.next([...this.groups]);
    }
  }

  addExpenseToGroup(groupId: number, expense: Expense): void {
    if (!this.groupExpenses[groupId]) {
      this.groupExpenses[groupId] = [];
    }
    this.groupExpenses[groupId].push(expense);
  }

  updateGroupTotalExpenses(groupId: number, amount: number): void {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      this.groups[groupIndex] = {
        ...this.groups[groupIndex],
        totalExpenses: this.groups[groupIndex].totalExpenses + amount
      };
      this.groupsSubject.next([...this.groups]);
    }
  }

  updateGroupBalanceLocally(groupId: number, balance: number): void {
    const groupIndex = this.groups.findIndex(g => g.id === groupId);
    if (groupIndex !== -1) {
      this.groups[groupIndex] = {
        ...this.groups[groupIndex],
        balance
      };
      this.groupsSubject.next([...this.groups]);
    }
  }

  // Aggregates for list page
  computeGroupTotalExpenses(groupId: number): number {
    const expenses = this.groupExpenses[groupId] || [];
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }

  computeUserBalanceForGroup(groupId: number, userUid: string | null | undefined): number {
    if (!userUid) return 0;
    const expenses = this.groupExpenses[groupId] || [];
    let totalYouOwe = 0;
    let totalYouAreOwed = 0;

    for (const expense of expenses) {
      const isPaidByYou = expense.paidByUid === userUid;

      for (const owed of expense.owedBy) {
        const isYou = owed.userUid === userUid;
        if (isYou && !isPaidByYou) {
          totalYouOwe += owed.amount;
        }
      }

      if (isPaidByYou) {
        for (const owed of expense.owedBy) {
          if (owed.userUid !== userUid) {
            totalYouAreOwed += owed.amount;
          }
        }
      }
    }

    return totalYouAreOwed - totalYouOwe;
  }

  // Helper method to resolve UIDs to GroupMembers
  getExpenseWithMembers(expense: Expense, groupMembers: GroupMember[]): ExpenseWithMembers {
    return {
      ...expense,
      addedBy: this.findMemberByUid(expense.addedByUid, groupMembers),
      paidBy: this.findMemberByUid(expense.paidByUid, groupMembers),
      owedBy: expense.owedBy.map(owed => ({
        user: this.findMemberByUid(owed.userUid, groupMembers),
        amount: owed.amount
      }))
    };
  }

  // Get expenses with resolved member data
  getExpensesWithMembers(groupId: number): Observable<ExpenseWithMembers[]> {
    return new Observable(observer => {
      const expenses = this.groupExpenses[groupId] || [];
      const members = this.groupMembers[groupId] || [];

      const expensesWithMembers = expenses.map(expense =>
        this.getExpenseWithMembers(expense, members)
      );

      observer.next(expensesWithMembers);
      observer.complete();
    });
  }

  // Get grouped expenses with resolved member data
  getGroupedExpensesWithMembers(groupId: number): Observable<GroupedExpensesWithMembers[]> {
    return new Observable(observer => {
      const expenses = this.groupExpenses[groupId] || [];
      const members = this.groupMembers[groupId] || [];

      const grouped = new Map<string, { label: string; expenses: ExpenseWithMembers[] }>();

      expenses.forEach(expense => {
        const year = expense.addedAt.getFullYear();
        const monthIndex = expense.addedAt.getMonth() + 1; // 1-12
        const key = `${year}-${String(monthIndex).padStart(2, '0')}`;
        const label = expense.addedAt.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!grouped.has(key)) {
          grouped.set(key, { label, expenses: [] });
        }
        grouped.get(key)!.expenses.push(this.getExpenseWithMembers(expense, members));
      });

      const groupedExpenses = Array.from(grouped.entries())
        .sort((a, b) => b[0].localeCompare(a[0])) // sort by YYYY-MM desc
        .map(([_, value]) => ({
          month: value.label,
          expenses: value.expenses.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
        }));

      observer.next(groupedExpenses);
      observer.complete();
    });
  }

  // Helper method to find member by UID
  private findMemberByUid(uid: string, members: GroupMember[]): GroupMember | undefined {
    return members.find(m => m.uid === uid);
  }


  /**
   * Resolves Firebase UID for a given email address
   * @param email - The email address to look up
   * @returns Promise<UidResolutionResult> - Result of the UID resolution
   */
  private async findUserByEmail(email: string): Promise<UidResolutionResult> {
    try {
      // Validate input
      if (!email || !this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Invalid email address',
          source: 'not-found'
        };
      }

      // Try backend API first (works in both browser and SSR)
      const backendResult = await this.getUidFromBackendApi(email);
      if (backendResult.success) {
        return backendResult;
      }

      // In browser only: try to get current user UID
      if (isPlatformBrowser(this.platformId)) {
        const currentUserResult = await this.getCurrentUserUid(email);
        if (currentUserResult.success) {
          return currentUserResult;
        }

        // In browser only: check if user exists (for better UX messaging)
        const existenceResult = await this.checkUserExistence(email);
        return existenceResult;
      }

      // Fallback for non-browser environments
      return {
        success: false,
        error: 'UID not found',
        source: 'not-found'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        source: 'not-found'
      };
    }
  }

  /**
   * Gets UID for current signed-in user if email matches
   */
  private async getCurrentUserUid(email: string): Promise<UidResolutionResult> {
    try {
      const auth = getAuth();
      if (!auth) {
        return { success: false, error: 'Firebase Auth not initialized', source: 'not-found' };
      }

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === email) {
        return {
          success: true,
          uid: currentUser.uid,
          source: 'current-user'
        };
      }

      return { success: false, error: 'Not current user', source: 'not-found' };
    } catch (error: any) {
      return { success: false, error: error.message, source: 'not-found' };
    }
  }

  /**
   * Gets UID from backend API
   */
  private async getUidFromBackendApi(email: string): Promise<UidResolutionResult> {
    try {
      const response = await this.http.get<BackendApiResponse>(`${this.apiUrl}/users/uid-by-email?email=${encodeURIComponent(email)}`).toPromise();

      if (response && response.success && response.uid) {
        return {
          success: true,
          uid: response.uid,
          source: 'backend-api'
        };
      }

      return { success: false, error: response?.error || 'No UID found', source: 'backend-api' };
    } catch (apiError: any) {
      if (apiError.status === 404) {
        return { success: false, error: 'User not found', source: 'backend-api' };
      } else {
        return { success: false, error: apiError.message, source: 'backend-api' };
      }
    }
  }

  /**
   * Checks if user exists in Firebase using sign-in methods
   */
  private async checkUserExistence(email: string): Promise<UidResolutionResult> {
    try {
      const auth = getAuth();
      const { fetchSignInMethodsForEmail } = await import('firebase/auth');
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods && signInMethods.length > 0) {
        return {
          success: false,
          error: 'User exists but UID not accessible without backend API',
          source: 'signin-methods'
        };
      } else {
        return {
          success: false,
          error: 'User not registered in Firebase',
          source: 'not-found'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        source: 'signin-methods'
      };
    }
  }

  /**
   * Validates email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
