import { Component, inject, OnInit, OnDestroy, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { GroupComponent } from '../group.component';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'app-group-expenses',
  standalone: true,
  imports: [ScrollPanelModule, CardModule, TagModule, SplitterModule, CommonModule, ButtonModule],
  templateUrl: './group-expenses.component.html',
  styleUrls: ['../group.component.scss','./group-expenses.component.scss']
})
export class GroupExpensesComponent implements OnInit, OnDestroy {
  private readonly parentGroupComponent = inject(GroupComponent);
  private readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private authSubscription?: Subscription;

  selectedExpense: any = null;
  currentUser: any = null;

  // Tooltip properties
  showDateTooltip = false;
  dateTooltipText = '';
  tooltipLeftPx = 0;
  tooltipTopPx = 0;

  isSmallScreen = false; // <lg

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 1024;
    }
  }

  get groupedExpenses() {
    return this.parentGroupComponent.groupedExpenses;
  }

  get groupId() {
    return this.parentGroupComponent.groupId;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 1024;
    }
    this.getCurrentUser();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onExpenseAdded(): void {
    this.parentGroupComponent.loadGroupData();
  }

  selectExpense(expense: any): void {
    this.selectedExpense = expense;
  }

  onEditExpense(expenseId: string): void {
    // TODO: Implement edit expense functionality
    console.log('Edit expense:', expenseId);
  }

  // User involvement checks
  isUserInvolved(expense: any): boolean {
    if (!this.currentUser) return false;
    return this.isUserPaidBy(expense) || this.isUserInOwedBy(expense);
  }

  isUserPaidBy(expense: any): boolean {
    if (!this.currentUser) return false;
    return expense.paidBy?.uid === this.currentUser.uid;
  }

  isUserInOwedBy(expense: any): boolean {
    if (!this.currentUser || !expense.owedBy) return false;
    return expense.owedBy.some((person: any) => person.user?.uid === this.currentUser.uid);
  }

  // Amount calculations
  getUserOwesAmount(expense: any): number {
    if (!this.currentUser || !expense.owedBy) return 0;
    const userOwed = expense.owedBy.find((person: any) => person.user?.uid === this.currentUser.uid);
    return userOwed ? userOwed.amount : 0;
  }

  getUserOwedAmount(expense: any): number {
    if (this.isUserPaidBy(expense)) {
      const userOwedAmount = this.getUserOwesAmount(expense);
      return expense.amount - userOwedAmount;
    }
    return 0;
  }

  getUserBalance(expense: any): number {
    if (this.isUserPaidBy(expense)) {
      return this.getUserOwedAmount(expense);
    } else if (this.isUserInOwedBy(expense)) {
      return -this.getUserOwesAmount(expense);
    }
    return 0;
  }

  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  // Avatar helpers
  getAvatarUrl(uid?: string, nameFallback?: string, size: number = 64): string | null {
    const seed = uid || nameFallback;
    if (!seed) return null;
    return `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
  }

  resolveAvatar(user: any, size: number = 64): string | null {
    if (!user) return null;
    const directPhoto = user.avatar || user.photoURL || user.photoUrl || user.photo || user.avatarUrl;
    if (directPhoto) return directPhoto;
    try {
      const members = this.parentGroupComponent?.members || [];
      const member = members.find((m: any) => m?.uid === user?.uid);
      if (member?.avatar) return member.avatar;
    } catch {}
    return this.getAvatarUrl(user?.uid, user?.name, size);
  }

  // Tooltip methods
  showDateHoverBadge(event: MouseEvent, addedAt: string | Date | null | undefined): void {
    const host = event.currentTarget as HTMLElement;
    if (!host) return; 

    const rect = host.getBoundingClientRect();
    this.tooltipLeftPx = Math.round(rect.left + rect.width / 2);
    this.tooltipTopPx = Math.round(rect.bottom + 8);

    try {
      this.dateTooltipText = addedAt
        ? new Date(addedAt).toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        : '';
    } catch {
      this.dateTooltipText = '';
    }

    this.showDateTooltip = !!this.dateTooltipText;
  }

  hideDateHoverBadge(): void {
    this.showDateTooltip = false;
  }

  private getCurrentUser(): void {
    this.authSubscription = this.authService.isLoggedIn().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error getting current user:', error);
        this.currentUser = null;
      }
    });
  }
}
