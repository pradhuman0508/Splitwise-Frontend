import { Component, OnInit, ElementRef, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { GroupsService, Expense, GroupedExpenses, Group, GroupMember } from '../groups.service';
import { GroupDetailsComponent } from '../group-details/group-details.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AvatarGroup } from 'primeng/avatargroup';
import { Avatar } from 'primeng/avatar';  

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
    TagModule,
    ScrollPanelModule,
    GroupDetailsComponent,
    ToastModule,
    AvatarGroup,
    Avatar
  ],
  providers: [MessageService]
})
export class GroupExpensesComponent implements OnInit {
  groupId: string | undefined;
  group?: Group;
  expenses: Expense[] = [];
  members: GroupMember[] = [];
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
    this.route.params.subscribe(params => {
      this.groupId = params['id'];
      this.loadGroupData();
    });
  }

  isExpanded = false;

  @ViewChild('cardRef') cardRef!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;

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
    event.stopPropagation();
  }

  startNameEdit(event: Event) {
    event.stopPropagation();
    this.previousName = this.group?.name;
    this.isEditingName = true;
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
    });
  }

  saveGroupName(newName: string) {
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

    const trimmedName = newName.trim();
    Promise.resolve().then(() => {
      if (!this.group) return;
      this.group.name = trimmedName;
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
      if (this.group) {
        this.group.name = this.previousName || '';
      }
      this.cdr.detectChanges();
    });
  }

  loadGroupData() {
    this.groupsService.getGroups().subscribe(groups => {
      this.group = groups.find(g => g.id === Number(this.groupId));
    });

    if (this.groupId) {
      this.groupsService.getGroupExpenses(Number(this.groupId)).subscribe(expenses => {
        // Ensure dates are properly parsed
        this.expenses = expenses.map(expense => ({
          ...expense,
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt)
        }));
        this.groupExpensesByMonth();
      });
      this.loadGroupMembers();
    }
  }
  

  loadGroupMembers() {
    this.groupsService.getGroupMembers(Number(this.groupId)).subscribe(members => {
      this.members = members;
    });
  }

  groupExpensesByMonth() {
    const grouped = new Map<string, Expense[]>();
    const monthOrder = new Map<string, number>();

    this.expenses.forEach(expense => {
      const date = expense.createdAt;
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped.has(monthYear)) {
        grouped.set(monthYear, []);
        // Store a sortable value for each month-year combination
        monthOrder.set(monthYear, date.getFullYear() * 12 + date.getMonth());
      }
      grouped.get(monthYear)?.push(expense);
    });

    this.groupedExpenses = Array.from(grouped.entries())
      .sort(([monthYearA], [monthYearB]) => {
        // Sort by the numeric value we stored (higher values = more recent dates)
        return monthOrder.get(monthYearB)! - monthOrder.get(monthYearA)!;
      })
      .map(([month, expenses]) => ({
        month,
        expenses: expenses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      }));
  }

  addExpense() {
    console.log('Add expense clicked for group:', this.groupId);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && this.groupId && this.group) {
      if (!file.type.startsWith('image/')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Please select an image file'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Image size should be less than 5MB'
        });
        return;
      }

      event.stopPropagation();
      this.isUploadingAvatar = true;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        this.group!.avatar = imageUrl;
        this.groupsService.updateGroupAvatarLocally(Number(this.groupId), imageUrl);

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Group avatar updated successfully'
        });

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

      reader.readAsDataURL(file);
    }
  }
} 