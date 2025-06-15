import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Group {
  id: number;
  name: string;
  description: string;
  memberCount: number;
  balance: number;
  totalExpenses: number;
  avatar: string;
  lastActivity: Date;
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
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
      lastActivity: new Date('2023-06-15')
    },
    {
      id: 2,
      name: 'Trip to Paris',
      description: 'Our amazing vacation',
      memberCount: 6,
      balance: -45,
      totalExpenses: 3200,
      avatar: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
      lastActivity: new Date('2023-05-20')
    },
    {
      id: 3,
      name: 'Office Lunch',
      description: 'Weekly team lunches',
      memberCount: 8,
      balance: 25,
      totalExpenses: 960,
      avatar: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
      lastActivity: new Date('2023-06-10')
    },
    {
      id: 4,
      name: 'Book Club',
      description: 'Monthly book purchases and snacks',
      memberCount: 5,
      balance: 15,
      totalExpenses: 350,
      avatar: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d',
      lastActivity: new Date('2023-06-01')
    }
  ];

  private groupsSubject = new BehaviorSubject<Group[]>(this.groups);

  constructor() { }

  getGroups(): Observable<Group[]> {
    return this.groupsSubject.asObservable();
  }

  addGroup(group: Group): void {
    this.groups = [...this.groups, group];
    this.groupsSubject.next(this.groups);
  }

  getNextId(): number {
    return Math.max(...this.groups.map(g => g.id), 0) + 1;
  }
}
