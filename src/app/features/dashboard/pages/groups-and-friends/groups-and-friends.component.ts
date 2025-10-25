import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { CreateGroupComponent } from "../../../groups/cards/create-group-card/create-group.component";
import { AddFriendComponent } from "../../../add-friend/add-friend.component";
import { Subscription } from 'rxjs';
import { GroupsService, Group } from '../../../groups/services/groups.service';
import { FriendsService } from '../../../friends/services/friends.service';
import { Friend } from '../../../shared/interfaces/common.interfaces';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-groups-and-friends',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    TooltipModule,
    CreateGroupComponent,
    AddFriendComponent
  ],
  templateUrl: './groups-and-friends.component.html',
  styleUrl: './groups-and-friends.component.scss'
})
export class GroupsAndFriendsComponent implements OnInit, OnDestroy {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  friends: Friend[] = [];
  filteredFriends: Friend[] = [];
  searchQuery: string = '';
  friendsSearchQuery: string = '';
  viewMode: 'grid' | 'list' = 'grid';
  friendsViewMode: 'grid' | 'list' = 'grid';
  private subscription!: Subscription;
  private friendsSubscription!: Subscription;
  selectedSort: string = 'name-asc';
  selectedFriendsSort: string = 'name-asc';
  showSortMenu: boolean = false;
  showFriendsSortMenu: boolean = false;
  isSorted: { [key: string]: boolean | null } = {
    name: null,
    members: null
  };
  isFriendsSorted: { [key: string]: boolean | null } = {
    name: null,
    balance: null,
    status: null
  };
  initialGroups: Group[] = [];
  initialFriends: Friend[] = [];

  constructor(
    private groupsService: GroupsService,
    private friendsService: FriendsService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load groups
    this.subscription = this.groupsService.getGroups().subscribe(groups => {
      // Ensure any pending invites (null uid) get reconciled for current user
      this.groupsService.reconcileNullUidsForCurrentUser();

      // Compute totals and balances only for groups where the user is a member
      this.authService.isLoggedIn().subscribe(user => {
        const currentUid = user?.uid || null;
        const currentEmail = user?.email || null;
        const visibleGroups = this.groupsService.getGroupsForUser(currentUid, currentEmail);

        this.groups = visibleGroups.map(g => ({
          ...g,
          totalExpenses: this.groupsService.computeGroupTotalExpenses(g.id),
          balance: this.groupsService.computeUserBalanceForGroup(g.id, currentUid),
          memberCount: this.groupsService.computeGroupMemberCount(g.id)
        }));
        this.initialGroups = [...this.groups]; // Store initial order
        this.applyFilters();
      });
    });

    // Load friends
    this.friendsSubscription = this.friendsService.getFriends().subscribe(friends => {
      this.friends = friends;
      this.initialFriends = [...this.friends]; // Store initial order
      this.applyFriendsFilters();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.friendsSubscription) {
      this.friendsSubscription.unsubscribe();
    }
  }

  applyFilters(): void {
    // Filter by search query
    this.filteredGroups = this.groups.filter(group =>
      group.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Apply sorting - if any field is sorted, maintain that sort
    const sortedField = Object.keys(this.isSorted).find(key => this.isSorted[key] !== null);
    if (sortedField) {
      const direction = this.isSorted[sortedField] ? 1 : -1;
      this.sortTableData(sortedField, direction);
    }
  }

  toggleSortMenu(): void {
    this.showSortMenu = !this.showSortMenu;
  }

  sortGroups(field: string): void {
    if (this.isSorted[field] === null || this.isSorted[field] === false) {
      // Sort ascending
      this.isSorted[field] = true;
      this.selectedSort = `${field}-asc`;
      this.sortTableData(field, 1);
    } else if (this.isSorted[field] === true) {
      // Sort descending
      this.isSorted[field] = false;
      this.selectedSort = `${field}-desc`;
      this.sortTableData(field, -1);
    }
    this.showSortMenu = false; // Close menu after selection
  }

  sortTableData(field: string, order: number): void {
    this.filteredGroups.sort((a, b) => {
      let value1: any;
      let value2: any;
      
      if (field === 'name') {
        value1 = a.name;
        value2 = b.name;
      } else if (field === 'members') {
        value1 = a.memberCount;
        value2 = b.memberCount;
      } else {
        value1 = (a as any)[field];
        value2 = (b as any)[field];
      }
      
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      }

      return order * result;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  // Friends methods
  applyFriendsFilters(): void {
    // Filter by search query
    this.filteredFriends = this.friends.filter(friend =>
      friend.name.toLowerCase().includes(this.friendsSearchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(this.friendsSearchQuery.toLowerCase())
    );

    // Apply sorting - if any field is sorted, maintain that sort
    const sortedField = Object.keys(this.isFriendsSorted).find(key => this.isFriendsSorted[key] !== null);
    if (sortedField) {
      const direction = this.isFriendsSorted[sortedField] ? 1 : -1;
      this.sortFriendsData(sortedField, direction);
    }
  }

  onFriendsSearch(): void {
    this.applyFriendsFilters();
  }

  toggleFriendsSortMenu(): void {
    this.showFriendsSortMenu = !this.showFriendsSortMenu;
  }

  sortFriends(field: string): void {
    if (this.isFriendsSorted[field] === null || this.isFriendsSorted[field] === false) {
      // Sort ascending
      this.isFriendsSorted[field] = true;
      this.selectedFriendsSort = `${field}-asc`;
      this.sortFriendsData(field, 1);
    } else if (this.isFriendsSorted[field] === true) {
      // Sort descending
      this.isFriendsSorted[field] = false;
      this.selectedFriendsSort = `${field}-desc`;
      this.sortFriendsData(field, -1);
    }
    this.showFriendsSortMenu = false; // Close menu after selection
  }

  sortFriendsData(field: string, order: number): void {
    this.filteredFriends.sort((a, b) => {
      let value1: any;
      let value2: any;
      
      if (field === 'name') {
        value1 = a.name;
        value2 = b.name;
      } else if (field === 'balance') {
        value1 = a.balance;
        value2 = b.balance;
      } else if (field === 'status') {
        value1 = a.status;
        value2 = b.status;
      } else {
        value1 = (a as any)[field];
        value2 = (b as any)[field];
      }
      
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      }

      return order * result;
    });
  }

  toggleFriendsViewMode(mode: 'grid' | 'list'): void {
    this.friendsViewMode = mode;
  }

  isFriendsGridView(): boolean {
    return this.friendsViewMode === 'grid';
  }

  isFriendsListView(): boolean {
    return this.friendsViewMode === 'list';
  }

  getFriendsSortIcon(field: string): string {
    if (this.isFriendsSorted[field] === true) {
      return 'pi-sort-amount-up-alt';
    } else {
      return 'pi-sort-amount-down';
    }
  }


  navigateToGroup(groupId: number): void {
    this.groupsService.navigateToGroup(groupId);
  }

  toggleViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  isGridView(): boolean {
    return this.viewMode === 'grid';
  }

  isListView(): boolean {
    return this.viewMode === 'list';
  }


  getCurrentSortLabel(field: string): string {
    return field === 'name' ? 'Name' : 'Members';
  }

  getSortIcon(field: string): string {
    if (this.isSorted[field] === true) {
      return 'pi-sort-amount-up-alt';
    } else {
      return 'pi-sort-amount-down';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-menu-container')) {
      this.showSortMenu = false;
    }
    if (!target.closest('.friends-sort-menu-container')) {
      this.showFriendsSortMenu = false;
    }
  }
}
