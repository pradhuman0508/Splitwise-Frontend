import { Component, OnInit, ElementRef, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { GroupsService, Expense, GroupedExpenses, Group, GroupMember } from '../groups.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AvatarGroup } from 'primeng/avatargroup';
import { Avatar } from 'primeng/avatar';
import { GroupDetailsComponent } from './group-details/group-details.component';
import { AddExpenseComponent } from '../../expenses/add-expense/add-expense.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ScrollPanelModule,
    GroupDetailsComponent,
    ToastModule,
    AvatarGroup,
    Avatar,
    RouterOutlet,
    RouterLink,
    AddExpenseComponent,
    RouterLinkActive
  ],
  providers: [MessageService]
})
export class GroupComponent implements OnInit {
  groupId: string | undefined;
  group?: Group;
  expenses: Expense[] = [];
  members: GroupMember[] = [];
  groupedExpenses: GroupedExpenses[] = [];
  isUploadingAvatar = false;
  isEditingName = false;
  isIExpanded = false;
  private previousName: string | undefined;

  @ViewChild('cardIRef') cardIRef!: ElementRef;
  @ViewChild('nameInput') nameInput!: ElementRef;

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

  toggleSlide() {
    this.isIExpanded = !this.isIExpanded;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.isIExpanded && this.cardIRef && !this.cardIRef.nativeElement.contains(event.target)) {
      this.isIExpanded = false;
    }
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    if (this.isIExpanded) {
      this.isIExpanded = false;
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
    this.isEditingName = false;
    if (this.group) {
      this.group.name = this.previousName || '';
    }
    this.cdr.detectChanges();
  }

  loadGroupData() {
    this.groupsService.getGroups().subscribe(groups => {
      this.group = groups.find(g => g.id === Number(this.groupId));
    });

    if (this.groupId) {
      this.groupsService.getGroupExpenses(Number(this.groupId)).subscribe(expenses => {
        this.expenses = expenses.map(expense => ({
          ...expense,
          createdAt: new Date(expense.addedAt),
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
      const date = expense.addedAt;
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped.has(monthYear)) {
        grouped.set(monthYear, []);
        monthOrder.set(monthYear, date.getFullYear() * 12 + date.getMonth());
      }
      grouped.get(monthYear)?.push(expense);
    });

    this.groupedExpenses = Array.from(grouped.entries())
      .sort(([monthYearA], [monthYearB]) => monthOrder.get(monthYearB)! - monthOrder.get(monthYearA)!)
      .map(([month, expenses]) => ({
        month,
        expenses: expenses.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      }));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file || !this.groupId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a valid image file'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'File size must be less than 5MB'
      });
      return;
    }

    this.isUploadingAvatar = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const avatarUrl = e.target.result;
      this.groupsService.updateGroupAvatarLocally(Number(this.groupId), avatarUrl);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Group avatar updated successfully!'
      });

      this.isUploadingAvatar = false;
    };

    reader.onerror = () => {
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
