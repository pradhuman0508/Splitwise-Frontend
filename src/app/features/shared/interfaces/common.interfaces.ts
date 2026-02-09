// Common interfaces for the hybrid approach

export interface Friend {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  owesTo: BalanceDetail[];
  owedBy: BalanceDetail[];
  addedAt: Date;
  lastActivityAt: Date;
  status: 'accepted' | 'pending' | 'rejected';
}

export interface BalanceDetail {
  amount: number;
  groupId?: string; // optional - tracks which group this balance is from
  description: string;
  date: Date;
}

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
  uid: string;
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
  updatedByUid: string | null;
  paidByUid: string;         // Just the UID
  addedAt: Date;
  updatedAt: Date | null;
  receiptImageUrl: string | null;
  owedBy: { userUid: string; amount: number }[];  // Just UIDs
}

export interface ExpenseWithMembers {
  expenseId: string;
  description: string;
  amount: number;
  currency: string;
  addedBy: GroupMember | undefined;
  updatedBy: GroupMember | undefined;
  paidBy: GroupMember | undefined;
  addedAt: Date;
  updatedAt: Date | null;
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
