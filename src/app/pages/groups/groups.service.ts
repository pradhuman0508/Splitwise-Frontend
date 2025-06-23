import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  name: string;
  email: string;
  avatar: string;
  balance: number;
  owesTo: { name: string; amount: number }[];
  owedBy: { name: string; amount: number }[];
}

export interface Expense {
  id: string;
  description: string;
  paidBy: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'settled' | 'unsettled';
}

export interface GroupedExpenses {
  month: string;
  expenses: Expense[];
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
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
        "balance": 50,
        "owesTo": [],
        "owedBy": [
          { "name": "Jane Smith", "amount": 30 },
          { "name": "Mike Johnson", "amount": 20 }
        ]
      },
      {
        "id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        "balance": -30,
        "owesTo": [
          { "name": "John Doe", "amount": 30 }
        ],
        "owedBy": []
      },
      {
        "id": 3,
        "name": "Mike Johnson",
        "email": "mike@example.com",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "balance": 100,
        "owesTo": [],
        "owedBy": [
          { "name": "John Doe", "amount": 20 },
          { "name": "Sarah Williams", "amount": 80 }
        ]
      },
      {
        "id": 4,
        "name": "Sarah Williams",
        "email": "sarah@example.com",
        "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        "balance": 0,
        "owesTo": [
          { "name": "Mike Johnson", "amount": 80 }
        ],
        "owedBy": []
      }
    ]

  };

  private groupExpenses: { [groupId: number]: Expense[] } = {
    1: [
      {
        id: '1',
        description: 'Dinner at Italian Restaurant',
        paidBy: 'John Doe',
        amount: 120.50,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        status: 'unsettled'
      },
      {
        id: '2',
        description: 'Movie Tickets',
        paidBy: 'Jane Smith',
        amount: 75.00,
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-10'),
        status: 'settled'
      },
      {
        id: '3',
        description: 'Groceries',
        paidBy: 'Mike Johnson',
        amount: 95.30,
        createdAt: new Date('2024-02-28'),
        updatedAt: new Date('2024-02-28'),
        status: 'unsettled'
      },
      {
        id: '4',
        description: 'Rent',
        paidBy: 'Yash',
        amount: 7000,
        createdAt: new Date('2024-03-28'),
        updatedAt: new Date('2024-03-28'),
        status: 'settled'
      },
      {
        id: '5',
        description: 'Free House',
        paidBy: 'Akshay',
        amount: 40000,
        createdAt: new Date('2025-05-23'),
        updatedAt: new Date('2025-05-23'),
        status: 'settled'
      },
      {
        id: '6',
        description: 'Costly dinner',
        paidBy: 'Ashwin',
        amount: 4000,
        createdAt: new Date('2025-04-23'),
        updatedAt: new Date('2025-04-23'),
        status: 'settled'
      },
      {
        id: '7',
        description: 'Costly dinner',
        paidBy: 'Ashwin',
        amount: 4000,
        createdAt: new Date('2022-04-22'),
        updatedAt: new Date('2022-04-22'),
        status: 'settled'
      }
    ]
  };

  private groupsSubject = new BehaviorSubject<Group[]>(this.groups);

  private apiUrl = '/api'; // Changed to relative URL

  constructor(private router: Router, private http: HttpClient) { }

  getGroups(): Observable<Group[]> {
    return this.groupsSubject.asObservable();
  }

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    return of(this.groupMembers[groupId] || []);
  }

  getGroupExpenses(groupId: number): Observable<Expense[]> {
    return of(this.groupExpenses[groupId] || []);
  }

  getGroupedExpenses(groupId: number): Observable<GroupedExpenses[]> {
    const expenses = this.groupExpenses[groupId] || [];
    const grouped = new Map<string, Expense[]>();

    expenses.forEach(expense => {
      const monthYear = expense.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped.has(monthYear)) {
        grouped.set(monthYear, []);
      }
      grouped.get(monthYear)?.push(expense);
    });

    const groupedExpenses = Array.from(grouped.entries()).map(([month, expenses]) => ({
      month,
      expenses: expenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
}
