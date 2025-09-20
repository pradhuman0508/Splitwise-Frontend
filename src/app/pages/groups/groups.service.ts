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
      balance: 120,
      totalExpenses: 2450,
      avatar: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
      createdAt: new Date('2023-06-15')
    },
    {
      id: 2,
      name: 'Trip to Paris',
      description: 'Our amazing vacation',
      memberCount: 6,
      balance: -45,
      totalExpenses: 3200,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
      createdAt: new Date('2023-05-20')
    },
    {
      id: 3,
      name: 'Office Lunch',
      description: 'Weekly team lunches',
      memberCount: 8,
      balance: 25,
      totalExpenses: 960,
      avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
      createdAt: new Date('2023-06-10')
    },
    {
      id: 4,
      name: 'Book Club',
      description: 'Monthly book purchases and snacks',
      memberCount: 5,
      balance: 15,
      totalExpenses: 350,
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
        "uid": "firebase-uid-pradhuman-vaidya",
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
        "uid": "firebase-uid-test-user",
        "name": "Test User",
        "email": "testUser@gmail.com",
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
        "uid": "firebase-uid-clone-splitwise",
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
        "uid": "pending-firebase-uid",
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
        "uid": "firebase-uid-ashwin",
        "name": "Ashwin",
        "email": "ashwin123@gmail.com",
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
        paidByUid: 'firebase-uid-pradhuman-vaidya',
        addedAt: new Date('2025-09-15T19:30:00Z'),
        updatedAt: new Date('2025-09-16T09:10:00Z'),
        receiptImageUrl: 'https://cdn.vertex42.com/ExcelTemplates/Images/invoices/blank-invoice-template.png',
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 875 },
          { userUid: 'firebase-uid-pradhuman-vaidya', amount: 875 },
          { userUid: 'firebase-uid-test-user', amount: 875 },
          { userUid: 'firebase-uid-clone-splitwise', amount: 875 }
        ]
      },
      {
        expenseId: 'e202',
        description: 'Taxi from Airport to Hotel',
        amount: 1200,
        currency: 'INR',
        addedByUid: 'firebase-uid-test-user',
        paidByUid: 'firebase-uid-test-user',
        addedAt: new Date('2025-09-14T14:15:00Z'),
        updatedAt: new Date('2025-09-14T14:15:00Z'),
        receiptImageUrl: null,
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 300 },
          { userUid: 'firebase-uid-pradhuman-vaidya', amount: 300 },
          { userUid: 'firebase-uid-test-user', amount: 300 },
          { userUid: 'firebase-uid-clone-splitwise', amount: 300 }
        ]
      },
      {
        expenseId: 'e203',
        description: 'Hotel Room Booking',
        amount: 8000,
        currency: 'INR',
        addedByUid: 'firebase-uid-clone-splitwise',
        paidByUid: 'firebase-uid-clone-splitwise',
        addedAt: new Date('2025-09-13T10:00:00Z'),
        updatedAt: new Date('2025-09-13T10:00:00Z'),
        receiptImageUrl: 'https://cdn.vectorstock.com/i/1000v/30/08/receipt-bill-paper-invoicereceipt-template-vector-37033008.jpg',
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 2000 },
          { userUid: 'firebase-uid-pradhuman-vaidya', amount: 2000 },
          { userUid: 'firebase-uid-test-user', amount: 2000 },
          { userUid: 'firebase-uid-clone-splitwise', amount: 2000 }
        ]
      },
      {
        expenseId: 'e204',
        description: 'Beach Activities',
        amount: 2400,
        currency: 'INR',
        addedByUid: 'firebase-uid-yash-0098209295',
        paidByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        addedAt: new Date('2025-09-16T16:45:00Z'),
        updatedAt: new Date('2025-09-16T16:45:00Z'),
        receiptImageUrl: null,
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 600 },
          { userUid: 'firebase-uid-pradhuman-vaidya', amount: 600 },
          { userUid: 'firebase-uid-test-user', amount: 600 },
          { userUid: 'firebase-uid-clone-splitwise', amount: 600 }
        ]
      },
      {
        expenseId: 'e205',
        description: 'Dinner at Fisherman\'s Wharf',
        amount: 3500,
        currency: 'INR',
        addedByUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1',
        paidByUid: 'firebase-uid-pradhuman-vaidya',
        addedAt: new Date('2025-09-19T19:30:00Z'),
        updatedAt: new Date('2025-09-19T09:10:00Z'),
        receiptImageUrl: 'https://cdn.vertex42.com/ExcelTemplates/Images/invoices/blank-invoice-template.png',
        owedBy: [
          { userUid: 'SVDRpbKNM1VTqkuov5cnbM0bkpr1', amount: 875 },
          { userUid: 'firebase-uid-pradhuman-vaidya', amount: 875 },
          { userUid: 'firebase-uid-test-user', amount: 875 },
          { userUid: 'firebase-uid-clone-splitwise', amount: 875 }
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
    const grouped = new Map<string, Expense[]>();

    expenses.forEach(expense => {
      const monthYear = expense.addedAt.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped.has(monthYear)) {
        grouped.set(monthYear, []);
      }
      grouped.get(monthYear)?.push(expense);
    });

    const groupedExpenses = Array.from(grouped.entries()).map(([month, expenses]) => ({
      month,
      expenses: expenses.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
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
      
      const grouped = new Map<string, ExpenseWithMembers[]>();

      expenses.forEach(expense => {
        const monthYear = expense.addedAt.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!grouped.has(monthYear)) {
          grouped.set(monthYear, []);
        }
        grouped.get(monthYear)?.push(this.getExpenseWithMembers(expense, members));
      });

      const groupedExpenses = Array.from(grouped.entries()).map(([month, expenses]) => ({
        month,
        expenses: expenses.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
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
   * Tests UID resolution for specific emails (Development/Testing only)
   * @param emails - Array of emails to test (optional, defaults to common test emails)
   */
  async testUidResolution(emails?: string[]): Promise<UidResolutionResult[]> {
    console.log('🔍 Testing UID resolution for specific emails...');
    console.log('📝 Note: This will get REAL Firebase UIDs, not mock data');
    
    // Test backend API connection first
    const backendStatus = await this.testBackendConnection();
    
    const testEmails = emails || [
      'bakadiyayash@gmail.com',
      'yash0098209295@gmail.com'
    ];

    const results: UidResolutionResult[] = [];

    for (const email of testEmails) {
      console.log(`\n🔍 Checking ${email}...`);
      const result = await this.findUserByEmail(email);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ Successfully resolved REAL Firebase UID for ${email}: ${result.uid}`);
      } else {
        console.log(`❌ Failed to resolve UID for ${email}: ${result.error}`);
      }
    }
    
    // Log summary
    const successCount = results.filter(r => r.success).length;
    console.log(`\n📊 Summary: ${successCount}/${results.length} UIDs resolved successfully`);
    
    if (!backendStatus) {
      console.log('💡 Backend API setup: cd backend && npm install && npm start');
    }
    
    return results;
  }

  /**
   * Tests backend API connection
   * @returns Promise<boolean> - true if backend is available
   */
  private async testBackendConnection(): Promise<boolean> {
    try {
      console.log('🔌 Testing backend API connection...');
      const response = await this.http.get(`${this.apiUrl}/health`).toPromise();
      console.log('✅ Backend API is running:', response);
      return true;
    } catch (error: any) {
      console.log('❌ Backend API not available:', error.message);
      return false;
    }
  }

  /**
   * Resolves UIDs for all group members that have temporary or fake UIDs
   * @param groupId - The group ID to resolve UIDs for
   * @returns Promise<{resolved: number, total: number}> - Resolution statistics
   */
  async resolveMemberUids(groupId: number): Promise<{resolved: number, total: number}> {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('❌ UID resolution not available in SSR environment');
      return { resolved: 0, total: 0 };
    }
    
    console.log(`🔄 Resolving UIDs for group ${groupId}...`);
    const members = this.groupMembers[groupId] || [];
    let resolvedCount = 0;
    
    for (const member of members) {
      // Check if UID needs resolution (temp or fake UIDs)
      if (this.needsUidResolution(member.uid)) {
        try {
          console.log(`🔍 Resolving UID for ${member.name} (${member.email})...`);
          const result = await this.findUserByEmail(member.email);
          
          if (result.success && result.uid) {
            const oldUid = member.uid;
            member.uid = result.uid;
            console.log(`✅ Updated UID for ${member.name}: ${oldUid} → ${result.uid}`);
            resolvedCount++;
          } else {
            console.log(`⚠️  Could not resolve UID for ${member.name} (${member.email}): ${result.error}`);
          }
        } catch (error: any) {
          console.error(`❌ Error resolving UID for ${member.email}:`, error);
        }
      } else {
        console.log(`ℹ️  ${member.name} already has a valid UID: ${member.uid}`);
      }
    }
    
    console.log(`✅ UID resolution complete. Resolved ${resolvedCount} out of ${members.length} members.`);
    return { resolved: resolvedCount, total: members.length };
  }

  /**
   * Checks if a UID needs resolution
   * @param uid - The UID to check
   * @returns boolean - true if UID needs resolution
   */
  private needsUidResolution(uid: string): boolean {
    return uid.startsWith('temp-uid-') || 
           uid.startsWith('firebase-uid-') || 
           uid.startsWith('pending-firebase-uid') ||
           uid === 'unknown';
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

      // Check if we're in browser environment
      if (!isPlatformBrowser(this.platformId)) {
        return {
          success: false,
          error: 'Firebase Auth not available in SSR environment',
          source: 'not-found'
        };
      }

      // Try to get current user UID first
      const currentUserResult = await this.getCurrentUserUid(email);
      if (currentUserResult.success) {
        return currentUserResult;
      }

      // Try backend API
      const backendResult = await this.getUidFromBackendApi(email);
      if (backendResult.success) {
        return backendResult;
      }

      // Check if user exists in Firebase
      const existenceResult = await this.checkUserExistence(email);
      return existenceResult;

    } catch (error: any) {
      console.error(`❌ Error resolving UID for ${email}:`, error);
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
        console.log(`✅ Found current user UID for ${email}: ${currentUser.uid}`);
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
        console.log(`✅ Found UID for ${email} via backend API: ${response.uid}`);
        return {
          success: true,
          uid: response.uid,
          source: 'backend-api'
        };
      }

      return { success: false, error: response?.error || 'No UID found', source: 'backend-api' };
    } catch (apiError: any) {
      if (apiError.status === 404) {
        console.log(`❌ User ${email} not found in Firebase via backend API`);
        return { success: false, error: 'User not found', source: 'backend-api' };
      } else {
        console.log(`⚠️  Backend API error for ${email}:`, apiError.message);
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
        console.log(`✅ User ${email} exists in Firebase (${signInMethods.length} sign-in methods)`);
        console.log(`⚠️  Cannot get UID for ${email} without backend API. User needs to sign in to get their UID.`);
        return {
          success: false,
          error: 'User exists but UID not accessible without backend API',
          source: 'signin-methods'
        };
      } else {
        console.log(`❌ User ${email} is not registered in Firebase`);
        return {
          success: false,
          error: 'User not registered in Firebase',
          source: 'not-found'
        };
      }
    } catch (error: any) {
      console.log(`❌ Error checking if user ${email} exists:`, error);
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
