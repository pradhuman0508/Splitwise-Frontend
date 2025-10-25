import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Friend, BalanceDetail } from '../../shared/interfaces/common.interfaces';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private friends: Friend[] = [
    {
      uid: 'hDoEcQAufdZbNstzz0SjAsRnCzG2',
      name: 'Pradhuman Vaidya',
      email: 'pradhumanvaidya612@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=2',
      balance: 0,
      owesTo: [],
      owedBy: [],
      addedAt: new Date('2024-01-01'),
      lastActivityAt: new Date('2024-01-20'),
      status: 'accepted'
    },
    {
      uid: 'JVSdnKLZPyVisgcEI7seSKlsBv02',
      name: 'Yash 0098209295',
      email: 'yash0098209295@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
      balance: 0,
      owesTo: [],
      owedBy: [],
      addedAt: new Date('2024-01-05'),
      lastActivityAt: new Date('2024-01-18'),
      status: 'accepted'
    },
    {
      uid: 'Nx1feK6Wn9Z61d5pzs9XP0NzVBx1',
      name: 'Ashwin',
      email: 'qq@dd.cc',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
      balance: 0,
      owesTo: [],
      owedBy: [],
      addedAt: new Date('2024-01-08'),
      lastActivityAt: new Date('2024-01-19'),
      status: 'accepted'
    },
    {
      uid: 'TYjZMWaj09clFIocVywb4WWHYmW2',
      name: 'Akshay Shinde',
      email: 'akshay.shinde@gmail.com',
      avatar: 'https://i.pravatar.cc/150?img=11',
      balance: 0,
      owesTo: [],
      owedBy: [],
      addedAt: new Date('2024-01-08'),
      lastActivityAt: new Date('2024-01-19'),
      status: 'pending'
    }
  ];

  private friendsSubject = new BehaviorSubject<Friend[]>(this.friends);

  constructor() {}

  // Friends operations
  getFriends(): Observable<Friend[]> {
    return this.friendsSubject.asObservable();
  }

  getFriend(uid: string): Friend | undefined {
    return this.friends.find(friend => friend.uid === uid);
  }

  addFriend(friend: Friend): void {
    this.friends = [...this.friends, friend];
    this.friendsSubject.next(this.friends);
  }

  updateFriend(uid: string, updates: Partial<Friend>): void {
    const index = this.friends.findIndex(friend => friend.uid === uid);
    if (index !== -1) {
      this.friends[index] = { ...this.friends[index], ...updates };
      this.friendsSubject.next([...this.friends]);
    }
  }

  removeFriend(uid: string): void {
    this.friends = this.friends.filter(friend => friend.uid !== uid);
    this.friendsSubject.next(this.friends);
  }

  // Balance operations
  addBalanceDetail(friendUid: string, balanceDetail: BalanceDetail, type: 'owesTo' | 'owedBy'): void {
    const friend = this.getFriend(friendUid);
    if (friend) {
      friend[type].push(balanceDetail);
      friend.lastActivityAt = new Date();
      this.updateFriendBalance(friendUid);
      this.friendsSubject.next([...this.friends]);
    }
  }

  removeBalanceDetail(friendUid: string, balanceDetailIndex: number, type: 'owesTo' | 'owedBy'): void {
    const friend = this.getFriend(friendUid);
    if (friend) {
      friend[type].splice(balanceDetailIndex, 1);
      friend.lastActivityAt = new Date();
      this.updateFriendBalance(friendUid);
      this.friendsSubject.next([...this.friends]);
    }
  }

  private updateFriendBalance(friendUid: string): void {
    const friend = this.getFriend(friendUid);
    if (friend) {
      const totalOwedBy = friend.owedBy.reduce((sum, detail) => sum + detail.amount, 0);
      const totalOwesTo = friend.owesTo.reduce((sum, detail) => sum + detail.amount, 0);
      friend.balance = totalOwedBy - totalOwesTo;
    }
  }

  // Get friends with positive balance (they owe you)
  getFriendsWhoOweYou(): Observable<Friend[]> {
    return new Observable((observer: any) => {
      this.getFriends().subscribe((friends: Friend[]) => {
        const friendsWhoOwe = friends.filter((friend: Friend) => friend.balance > 0);
        observer.next(friendsWhoOwe);
      });
    });
  }

  // Get friends you owe money to
  getFriendsYouOwe(): Observable<Friend[]> {
    return new Observable((observer: any) => {
      this.getFriends().subscribe((friends: Friend[]) => {
        const friendsYouOwe = friends.filter((friend: Friend) => friend.balance < 0);
        observer.next(friendsYouOwe);
      });
    });
  }

  // Get friends with zero balance
  getSettledFriends(): Observable<Friend[]> {
    return new Observable((observer: any) => {
      this.getFriends().subscribe((friends: Friend[]) => {
        const settledFriends = friends.filter((friend: Friend) => friend.balance === 0);
        observer.next(settledFriends);
      });
    });
  }

  // Search friends by name or email
  searchFriends(query: string): Observable<Friend[]> {
    return new Observable((observer: any) => {
      this.getFriends().subscribe((friends: Friend[]) => {
        const filteredFriends = friends.filter((friend: Friend) => 
          friend.name.toLowerCase().includes(query.toLowerCase()) ||
          friend.email.toLowerCase().includes(query.toLowerCase())
        );
        observer.next(filteredFriends);
      });
    });
  }
}
