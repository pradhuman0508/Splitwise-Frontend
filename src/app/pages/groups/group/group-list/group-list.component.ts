import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { CreateGroupComponent } from '../create-group/create-group.component';
import { Subscription } from 'rxjs';
import { GroupsService, Group } from '../../groups.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CreateGroupComponent,
    CardModule,
    TooltipModule
  ],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.scss'
})
export class GroupListComponent implements OnInit, OnDestroy {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  searchQuery: string = '';
  private subscription!: Subscription;
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
    this.subscription = this.groupsService.getGroups().subscribe(groups => {
      this.groups = groups;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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

  navigateToGroup(groupId: number): void {
    this.groupsService.navigateToGroup(groupId);
  }

  createNewGroup(): void {
    this.router.navigate(['/groups/new']);
  }
}
