import { Component, OnInit, ElementRef, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { InplaceModule } from 'primeng/inplace';
import { GroupsService } from '../groups.service';
import { GroupDetailsComponent } from '../group-details/group-details.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

interface Expense {
  id: string;
  description: string;
  paidBy: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'settled' | 'unsettled';
}

interface GroupedExpenses {
  month: string;
  expenses: Expense[];
}

@Component({
  selector: 'app-group-expenses',
  templateUrl: './group-expenses.component.html',
  styleUrls: ['./group-expenses.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ButtonModule,
    CardModule,
    AvatarModule,
    TagModule,
    ScrollPanelModule,
    InplaceModule,
    GroupDetailsComponent,
    ToastModule
  ],
  providers: [MessageService]
})
export class GroupExpensesComponent implements OnInit {
  groupId: string | undefined;
  groupName: string | undefined;
  memberCount: number | undefined;
  groupImage: string | undefined;
  balance: number | undefined;
  totalExpenses: number | undefined;
  expenses: Expense[] = [];
  groupedExpenses: GroupedExpenses[] = [];
  isUploadingAvatar = false;
  isEditingName = false;
  private previousName: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Get the group ID from the route parameters
    this.route.params.subscribe(params => {
      this.groupId = params['id'];
      this.loadGroupData();
    });
  }

  isExpanded = false;

  @ViewChild('cardRef') cardRef!: ElementRef;

  toggleSlide() {
    console.log('toggleSlide', this.isExpanded);
    this.isExpanded = !this.isExpanded;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.isExpanded && this.cardRef && !this.cardRef.nativeElement.contains(event.target)) {
      this.isExpanded = false;
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    if (this.isExpanded) {
      this.isExpanded = false;
    }
  }

  onClickDisableDropDown(event: Event) {
    // Prevent the click event from bubbling up to parent elements
    event.stopPropagation();
  }

  startNameEdit(event: Event) {
    event.stopPropagation();
    this.previousName = this.groupName;
    this.isEditingName = true;
    // Focus the input element in the next tick
    setTimeout(() => {
      const input = document.querySelector('input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  saveGroupName(newName: string) {
    // Don't save if we're not in edit mode
    if (!this.isEditingName) {
      return;
    }

    if (!newName.trim() || !this.groupId) {
      this.cancelNameEdit();
      return;
    }

    if (newName.trim() === this.previousName) {
      this.isEditingName = false;
      return;
    }

    // Update locally first
    const trimmedName = newName.trim();
    Promise.resolve().then(() => {
      this.groupName = trimmedName;
      this.isEditingName = false;
      this.groupsService.updateGroupNameLocally(Number(this.groupId), trimmedName);
      this.cdr.detectChanges();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Group name updated successfully'
      });
    });
  }

  cancelNameEdit() {
    Promise.resolve().then(() => {
      this.isEditingName = false;
      this.groupName = this.previousName;
      this.cdr.detectChanges();
    });
  }

  loadGroupData() {
    // Subscribe to get the groups and find the specific group
    this.groupsService.getGroups().subscribe(groups => {
      const group = groups.find(g => g.id === Number(this.groupId));
      if (group) {
        this.groupName = group.name;
        this.memberCount = group.memberCount;
        this.groupImage = group.avatar;
        this.balance = group.balance;
        this.totalExpenses = group.totalExpenses;
      }
    });

    // TODO: Replace this with actual API call to fetch expense data
    // This is dummy data for demonstration
    this.expenses = [
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
      }
    ];

    this.groupExpensesByMonth();
  }

  groupExpensesByMonth() {
    const grouped = new Map<string, Expense[]>();

    this.expenses.forEach(expense => {
      const monthYear = expense.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped.has(monthYear)) {
        grouped.set(monthYear, []);
      }
      grouped.get(monthYear)?.push(expense);
    });

    this.groupedExpenses = Array.from(grouped.entries()).map(([month, expenses]) => ({
      month,
      expenses: expenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }));
  }

  addExpense() {
    // To be implemented: Open dialog for adding new expense
    console.log('Add expense clicked for group:', this.groupId);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.groupId) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select an image file'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Image size should be less than 5MB'
        });
        return;
      }

      // Prevent event propagation
      event.stopPropagation();
      
      // Set loading state
      this.isUploadingAvatar = true;
      
      // Create a preview URL using FileReader
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        
        // Update the local state
        this.groupImage = imageUrl;
        
        // Update the group in the service
        this.groupsService.updateGroupAvatarLocally(Number(this.groupId), imageUrl);
        
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Group avatar updated successfully'
        });
        
        // Reset loading state
        this.isUploadingAvatar = false;
      };
      
      reader.onerror = () => {
        console.error('Error reading file');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to read the image file. Please try again.'
        });
        this.isUploadingAvatar = false;
      };
      
      // Read the file as a data URL
      reader.readAsDataURL(file);
    }
  }
} 