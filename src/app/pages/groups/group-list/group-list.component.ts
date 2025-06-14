import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GroupsService } from '../groups.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { CreateGroupComponent } from '../create-group/create-group.component';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CreateGroupComponent,
    CardModule,
    TooltipModule,
    DropdownModule
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit {
  groups: any[] = [];
  filteredGroups: any[] = [];
  searchQuery: string = '';
  sortOptions = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Balance (High to Low)', value: 'balance-desc' },
    { label: 'Balance (Low to High)', value: 'balance-asc' },
    { label: 'Most Members', value: 'members-desc' },
    { label: 'Least Members', value: 'members-asc' }
  ];
  selectedSort: string = 'name-asc';

  constructor(
    private groupsService: GroupsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // In a real app, this would come from the service
    this.groups = [
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

    this.applyFilters();
  }

  applyFilters(): void {
    // Filter by search query
    this.filteredGroups = this.groups.filter(group =>
      group.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Apply sorting
    this.sortGroups();
  }

  sortGroups(): void {
    const [field, direction] = this.selectedSort.split('-');

    this.filteredGroups.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'balance':
          comparison = a.balance - b.balance;
          break;
        case 'members':
          comparison = a.memberCount - b.memberCount;
          break;
        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.sortGroups();
  }

  viewGroupDetails(groupId: number): void {
    this.router.navigate(['/groups', groupId]);
  }

  createNewGroup(): void {
    this.router.navigate(['/groups/new']);
  }
}
