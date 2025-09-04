import { Component, OnInit, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { GroupsService, Group, GroupMember, Expense } from '../../groups/groups.service';
import { AuthService } from '../../../core/auth.service';
import { getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  imports: [
    Dialog,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    CardModule,
    DividerModule,
    MessageModule,
    ToastModule
  ],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
  providers: [MessageService]
})
export class AddExpenseComponent implements OnInit {
  @Input() groupId?: number;
  @Input() showButton: boolean = true;
  @Output() expenseAdded = new EventEmitter<void>();

  visible: boolean = false;
  expenseForm: FormGroup;
  isSubmitting: boolean = false;
  formErrors: string[] = [];

  groups: Group[] = [];
  selectedGroupMembers: GroupMember[] = [];
  splitOptions = [
    { label: 'Split equally', value: 'equal' },
    { label: 'Split by percentage', value: 'percentage' },
    { label: 'Split by shares', value: 'shares' },
    { label: 'Split by amount', value: 'amount' }
  ];

  memberSplits: { member: GroupMember; amount: number; percentage: number; shares: number; involved: boolean }[] = [];

  // Getter for selected split option
  get selectedSplitOption(): string {
    return this.expenseForm.get('selectedSplitOption')?.value || 'equal';
  }

  constructor(
    private fb: FormBuilder,
    private groupsService: GroupsService,
    private authService: AuthService,
    private messageService: MessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.expenseForm = this.fb.group({
      description: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      groupId: [null, Validators.required],
      paidBy: ['', Validators.required],
      date: [new Date(), Validators.required],
      notes: [''],
      selectedSplitOption: ['equal']
    });
  }

  ngOnInit() {
    // Skip Firebase operations during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadGroups();
    if (this.groupId) {
      this.expenseForm.patchValue({ groupId: this.groupId });
      this.onGroupChange();
    } else {
      // Auto-select group if user is already in one
      this.autoSelectUserGroup();
    }
  }

  private loadGroups() {
    this.groupsService.getGroups().subscribe(groups => {
      this.groups = groups;
    });
  }

  private async autoSelectUserGroup() {
    try {
      const currentUser = getAuth().currentUser;
      if (currentUser) {
        // Find which group the current user belongs to
        for (const group of this.groups) {
          const members = await this.groupsService.getGroupMembers(group.id).toPromise();
          const isUserInGroup = members?.some(member => member.email === currentUser.email);
          if (isUserInGroup) {
            this.expenseForm.patchValue({ groupId: group.id });
            this.onGroupChange();
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error auto-selecting user group:', error);
    }
  }

  openNewExpenseModal() {
    this.visible = true;
    this.resetForm();
  }

  onGroupChange() {
    const groupId = this.expenseForm.get('groupId')?.value;
    if (groupId) {
      this.groupsService.getGroupMembers(groupId).subscribe(members => {
        this.selectedGroupMembers = members;
        // Reset member involvement to default (all involved) when group changes
        this.selectedGroupMembers.forEach(member => {
          member.involved = true;
        });
        this.initializeMemberSplits();
        this.updatePaidByOptions();
      });
    } else {
      // Clear members if no group selected
      this.selectedGroupMembers = [];
      this.memberSplits = [];
    }
  }

  private updatePaidByOptions() {
    // Only run Firebase operations on client side
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const currentUser = getAuth().currentUser;
    if (currentUser) {
      // Find current user in group members
      const currentMember = this.selectedGroupMembers.find(member =>
        member.email === currentUser.email
      );
      if (currentMember) {
        this.expenseForm.patchValue({ paidBy: currentMember.name });
      }
    }
  }

  private initializeMemberSplits() {
    this.memberSplits = this.selectedGroupMembers.map(member => ({
      member: { ...member, involved: true }, // Set default involvement
      amount: 0,
      percentage: 0,
      shares: 1,
      involved: true // Default to involved
    }));
    this.calculateSplits();
  }

  onUserInvolvementChange() {
    // Update member splits when user involvement changes
    this.memberSplits.forEach(split => {
      const member = this.selectedGroupMembers.find(m => m.id === split.member.id);
      if (member) {
        split.involved = member.involved || false;
      }
    });
    this.calculateSplits();
  }

  getInvolvedUserCount(): number {
    return this.selectedGroupMembers.filter(member => member.involved).length;
  }

  onSplitOptionChange() {
    // Set appropriate default values when switching split options
    this.setDefaultValuesForSplitOption();
    this.calculateSplits();
  }

  private setDefaultValuesForSplitOption() {
    const involvedSplits = this.memberSplits.filter(split => split.involved);
    const memberCount = involvedSplits.length;

    switch (this.selectedSplitOption) {
      case 'equal':
        // No need to set defaults for equal split
        break;

      case 'percentage':
        // Set equal percentages for involved members
        this.memberSplits.forEach(split => {
          if (split.involved) {
            split.percentage = 100 / memberCount;
          }
        });
        break;

      case 'shares':
        // Set equal shares (1) for involved members
        this.memberSplits.forEach(split => {
          if (split.involved) {
            split.shares = 1;
          }
        });
        break;

      case 'amount':
        // Set equal amounts for involved members
        const totalAmount = this.expenseForm.get('amount')?.value || 0;
        const equalAmount = totalAmount / memberCount;
        this.memberSplits.forEach(split => {
          if (split.involved) {
            split.amount = equalAmount;
          }
        });
        break;
    }
  }

  onAmountChange() {
    this.calculateSplits();
  }

  onMemberSplitChange(event: any, split: any) {
    split.involved = event.target.checked;
    this.calculateSplits();
  }

  // Enhanced split calculation with better handling
  private calculateSplits() {
    const totalAmount = this.expenseForm.get('amount')?.value || 0;
    const involvedMembers = this.memberSplits.filter(split => split.involved);
    const memberCount = involvedMembers.length;

    if (memberCount === 0 || totalAmount <= 0) {
      // Reset all splits to 0 if no members involved
      this.memberSplits.forEach(split => {
        split.amount = 0;
        split.percentage = 0;
        split.shares = 0;
      });
      return;
    }

    switch (this.selectedSplitOption) {
      case 'equal':
        this.calculateEqualSplit(totalAmount, memberCount);
        break;

      case 'percentage':
        this.calculatePercentageSplit(totalAmount);
        break;

      case 'shares':
        this.calculateSharesSplit(totalAmount);
        break;

      case 'amount':
        this.calculateAmountSplit(totalAmount);
        break;
    }
  }

  private calculateEqualSplit(totalAmount: number, memberCount: number) {
    const equalAmount = totalAmount / memberCount;
    this.memberSplits.forEach(split => {
      if (split.involved) {
        split.amount = equalAmount;
        split.percentage = (100 / memberCount);
        split.shares = 1;
      } else {
        split.amount = 0;
        split.percentage = 0;
        split.shares = 0;
      }
    });
  }

  private calculatePercentageSplit(totalAmount: number) {
    const involvedSplits = this.memberSplits.filter(split => split.involved);
    const totalPercentage = involvedSplits.reduce((sum, split) => sum + (split.percentage || 0), 0);

    if (totalPercentage > 0) {
      this.memberSplits.forEach(split => {
        if (split.involved) {
          split.amount = ((split.percentage || 0) / 100) * totalAmount;
          split.shares = 1;
        } else {
          split.amount = 0;
          split.percentage = 0;
          split.shares = 0;
        }
      });
    } else {
      // If no percentages set, default to equal split
      this.calculateEqualSplit(totalAmount, involvedSplits.length);
    }
  }

  private calculateSharesSplit(totalAmount: number) {
    const involvedSplits = this.memberSplits.filter(split => split.involved);
    const totalShares = involvedSplits.reduce((sum, split) => sum + (split.shares || 1), 0);

    if (totalShares > 0) {
      this.memberSplits.forEach(split => {
        if (split.involved) {
          split.amount = ((split.shares || 1) / totalShares) * totalAmount;
          split.percentage = ((split.shares || 1) / totalShares) * 100;
        } else {
          split.amount = 0;
          split.percentage = 0;
          split.shares = 0;
        }
      });
    } else {
      // If no shares set, default to equal split
      this.calculateEqualSplit(totalAmount, involvedSplits.length);
    }
  }

  private calculateAmountSplit(totalAmount: number) {
    const involvedSplits = this.memberSplits.filter(split => split.involved);
    const totalSplitAmount = involvedSplits.reduce((sum, split) => sum + (split.amount || 0), 0);

    if (totalSplitAmount > 0) {
      this.memberSplits.forEach(split => {
        if (split.involved) {
          split.percentage = ((split.amount || 0) / totalSplitAmount) * 100;
          split.shares = 1;
        } else {
          split.amount = 0;
          split.percentage = 0;
          split.shares = 0;
        }
      });
    } else {
      // If no amounts set, default to equal split
      this.calculateEqualSplit(totalAmount, involvedSplits.length);
    }
  }

  // Method to handle percentage input changes
  onPercentageChange(event: any, split: any) {
    if (split.involved && this.selectedSplitOption === 'percentage') {
      split.percentage = parseFloat(event.target.value) || 0;
      // Ensure percentage doesn't exceed 100
      if (split.percentage > 100) {
        split.percentage = 100;
      }
      this.calculateSplits();
    }
  }

  // Method to handle amount input changes
  onAmountInputChange(event: any, split: any) {
    if (split.involved && this.selectedSplitOption === 'amount') {
      split.amount = parseFloat(event.target.value) || 0;
      // Ensure amount doesn't exceed total expense amount
      const totalAmount = this.expenseForm.get('amount')?.value || 0;
      if (split.amount > totalAmount) {
        split.amount = totalAmount;
      }
      this.calculateSplits();
    }
  }

  // Method to handle shares input changes
  onSharesChange(event: any, split: any) {
    if (split.involved && this.selectedSplitOption === 'shares') {
      split.shares = parseInt(event.target.value) || 1;
      // Ensure shares is at least 1
      if (split.shares < 1) {
        split.shares = 1;
      }
      this.calculateSplits();
    }
  }

  // Method to reset all splits to equal distribution
  resetToEqualSplit() {
    this.expenseForm.patchValue({ selectedSplitOption: 'equal' });
    this.calculateSplits();
  }

  onSubmit() {
    this.formErrors = [];

    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      this.formErrors.push('Please fix the errors before submitting.');
      return;
    }

    if (this.selectedGroupMembers.length === 0) {
      this.formErrors.push('Please select a group with members.');
      return;
    }

    // Check if at least one user is involved
    const involvedUsers = this.memberSplits.filter(split => split.involved);
    if (involvedUsers.length === 0) {
      this.formErrors.push('Please select at least one user to be involved in this expense.');
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.expenseForm.value;
      const expense: Expense = {
        id: Date.now().toString(), // Generate unique ID
        description: formValue.description,
        paidBy: formValue.paidBy,
        amount: formValue.amount,
        createdAt: formValue.date,
        updatedAt: formValue.date,
        owes: formValue.owes
      };

      // Add expense to the group
      this.groupsService.addExpenseToGroup(formValue.groupId, expense);

      // Update group total expenses
      this.groupsService.updateGroupTotalExpenses(formValue.groupId, formValue.amount);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Expense added successfully!'
      });

      this.visible = false;
      this.resetForm();

      // Emit event to notify parent component
      this.expenseAdded.emit();

    } catch (error) {
      this.formErrors.push('Failed to add expense. Please try again.');
      console.error('Error adding expense:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private resetForm() {
    this.expenseForm.reset({
      description: '',
      amount: null,
      groupId: this.groupId || null,
      paidBy: '',
      date: new Date(),
      notes: ''
    });
    this.selectedGroupMembers = [];
    this.memberSplits = [];
    this.formErrors = [];

    // Reset member involvement when form is reset
    if (this.selectedGroupMembers.length > 0) {
      this.selectedGroupMembers.forEach(member => {
        member.involved = true;
      });
    }
  }

  getTotalSplitAmount(): number {
    return this.memberSplits
      .filter(split => split.involved)
      .reduce((sum, split) => sum + (split.amount || 0), 0);
  }

  getSplitDifference(): number {
    const totalAmount = this.expenseForm.get('amount')?.value || 0;
    return totalAmount - this.getTotalSplitAmount();
  }

  isSplitValid(): boolean {
    const difference = Math.abs(this.getSplitDifference());
    return difference < 0.01; // Allow for small rounding differences
  }

  isFormValid(): boolean {
    return this.expenseForm.valid &&
           this.isSplitValid() &&
           this.getInvolvedUserCount() > 0;
  }

  // Get validation message for split
  getSplitValidationMessage(): string {
    if (this.getInvolvedUserCount() === 0) {
      return 'Please select at least one user to be involved in this expense.';
    }

    if (!this.isSplitValid()) {
      const difference = this.getSplitDifference();
      if (difference > 0) {
        return `Split amounts are ₹${Math.abs(difference).toFixed(2)} less than the total expense amount.`;
      } else {
        return `Split amounts are ₹${Math.abs(difference).toFixed(2)} more than the total expense amount.`;
      }
    }

    return '';
  }

  // Get total percentage for percentage split
  getTotalPercentage(): number {
    if (this.selectedSplitOption !== 'percentage') {
      return 0;
    }
    return this.memberSplits
      .filter(split => split.involved)
      .reduce((sum, split) => sum + (split.percentage || 0), 0);
  }

  // Get total shares for shares split
  getTotalShares(): number {
    if (this.selectedSplitOption !== 'shares') {
      return 0;
    }
    return this.memberSplits
      .filter(split => split.involved)
      .reduce((sum, split) => sum + (split.shares || 1), 0);
  }
}
