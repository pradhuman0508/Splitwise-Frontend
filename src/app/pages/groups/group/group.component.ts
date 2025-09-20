import { Component, OnInit, ElementRef, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { GroupsService, GroupedExpensesWithMembers, Group, GroupMember, ExpenseWithMembers } from '../groups.service';
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
  expenses: ExpenseWithMembers[] = [];
  members: GroupMember[] = [];
  groupedExpenses: GroupedExpensesWithMembers[] = [];
  isUploadingAvatar = false;
  isEditingName = false;
  isIExpanded = false;
  isTestingUids = false;
  isDevelopmentMode = true; // Set to false in production
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
      // Use the new method that returns expenses with resolved member data
      this.groupsService.getGroupedExpensesWithMembers(Number(this.groupId)).subscribe(groupedExpenses => {
        this.groupedExpenses = groupedExpenses.map(group => ({
          ...group,
          expenses: group.expenses.map(expense => ({
            ...expense,
            createdAt: new Date(expense.addedAt),
            updatedAt: new Date(expense.updatedAt)
          }))
        }));
        
        // Flatten expenses for backward compatibility
        this.expenses = groupedExpenses.flatMap(group => group.expenses).map(expense => ({
          ...expense,
          createdAt: new Date(expense.addedAt),
          updatedAt: new Date(expense.updatedAt)
        }));
      });
      this.loadGroupMembers();
    }
  }

  loadGroupMembers() {
    this.groupsService.getGroupMembers(Number(this.groupId)).subscribe(members => {
      this.members = members;
    });
  }

  /**
   * Tests UID resolution for group members (Development/Testing only)
   * This method should be removed in production
   */
  async testUidResolution(): Promise<void> {
    if (this.isTestingUids) return; // Prevent multiple simultaneous tests
    
    this.isTestingUids = true;
    
    try {
      console.log('🧪 Testing UID resolution for group members...');
      
      if (!this.groupId) {
        console.warn('⚠️  No group ID available for testing');
        this.messageService.add({
          severity: 'warn',
          summary: 'Test Warning',
          detail: 'No group ID available for testing'
        });
        return;
      }

      // Test specific emails first
      const testEmails = this.getTestEmails();
      const emailResults = await this.groupsService.testUidResolution(testEmails);
      
      // Resolve UIDs for current group members
      const groupResults = await this.groupsService.resolveMemberUids(Number(this.groupId));
      
      // Show summary
      this.showTestSummary(emailResults, groupResults);
      
    } catch (error: any) {
      console.error('❌ Error during UID resolution test:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Test Error',
        detail: 'Failed to test UID resolution. Check console for details.'
      });
    } finally {
      this.isTestingUids = false;
    }
  }

  /**
   * Gets test emails for UID resolution testing
   * @returns string[] - Array of test email addresses
   */
  private getTestEmails(): string[] {
    const testEmails = ['bakadiyayash@gmail.com', 'yash0098209295@gmail.com'];
    
    // Add current group member emails if available
    if (this.members.length > 0) {
      const memberEmails = this.members
        .map(member => member.email)
        .filter(email => email && !testEmails.includes(email))
        .slice(0, 3); // Limit to 3 additional emails
      
      testEmails.push(...memberEmails);
    }
    
    return testEmails;
  }

  /**
   * Shows test summary in console and UI
   * @param emailResults - Results from email testing
   * @param groupResults - Results from group member resolution
   */
  private showTestSummary(emailResults: any[], groupResults: {resolved: number, total: number}): void {
    const emailSuccessCount = emailResults.filter(r => r.success).length;
    const totalEmails = emailResults.length;
    
    console.log(`\n📊 Test Summary:`);
    console.log(`   Email Tests: ${emailSuccessCount}/${totalEmails} successful`);
    console.log(`   Group Members: ${groupResults.resolved}/${groupResults.total} UIDs resolved`);
    
    // Show success message in UI
    this.messageService.add({
      severity: 'success',
      summary: 'UID Resolution Test Complete',
      detail: `Resolved ${emailSuccessCount}/${totalEmails} emails and ${groupResults.resolved}/${groupResults.total} group members`
    });
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
