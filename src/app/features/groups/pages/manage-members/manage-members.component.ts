import { Component, OnInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { GroupsService, GroupMember } from '../../../../features/groups/services/groups.service';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [CommonModule, FloatLabelModule, ScrollPanelModule, ButtonModule, ReactiveFormsModule, InputTextModule, TooltipModule, Dialog],
  templateUrl: './manage-members.component.html',
  styleUrls: ['../group.component.scss', './manage-members.component.scss']
})
export class ManageMembersComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLElement>;

  groupId!: number;
  members: GroupMember[] = [];
  memberForm: FormGroup;
  selectedMember: GroupMember | null = null;
  visible: boolean = false;
  removalSuccess = false;
  isSubmitting = false;
  canScrollLeftFlag = false;
  canScrollRightFlag = false;

  private readonly destroy$ = new Subject<void>();

  private static readonly INITIAL_FLAGS_DELAY_MS = 100;
  private static readonly UPDATE_FLAGS_DELAY_MS = 300;
  private static readonly SCROLL_DELTA = 100;
  private static readonly SCROLL_FLAG_EPSILON = 10;

  constructor(
    private groupsService: GroupsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
    this.memberForm = this.fb.group({
      members: this.fb.array([])
    });
  }

  ngOnInit() {
    // Resolve group ID from parent route first, fallback to current route
    const parentId = this.route.parent?.snapshot.paramMap.get('id');
    const selfId = this.route.snapshot.paramMap.get('id');
    const idParam = parentId ?? selfId ?? '';
    const parsedId = Number(idParam);

    if (Number.isFinite(parsedId)) {
      this.groupId = parsedId;
      this.groupsService.getGroupMembers(this.groupId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
        next: (members) => {
          this.members = members || [];
          // Add sample avatars for demonstration if members don't have avatars
          this.members.forEach((member, index) => {
            if (!member.avatar) {
              member.avatar = `https://i.pravatar.cc/150?img=${index + 1}`;
            }
          });
          // Update scroll flags after members are loaded
          setTimeout(() => this.updateScrollFlags(), ManageMembersComponent.INITIAL_FLAGS_DELAY_MS);
        },
        error: (error) => {
          console.error('Error fetching members:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openDialog(): void {
    this.visible = true;
    // Ensure at least one row is available for input
    if (this.membersFormArray.length === 0) {
      this.addMember();
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else if (this.groupId) {
      this.router.navigate(['/group', String(this.groupId)]);
    }
  }

  get membersFormArray(): FormArray {
    return this.memberForm.get('members') as FormArray;
  }

  createMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  addMember(): void {
    if (this.membersFormArray.length < 10) {
      this.membersFormArray.push(this.createMember());
    }
  }

  onSubmit(): void {
    // Expect exactly one member row; validate it
    const control = this.membersFormArray.at(0) as FormGroup | undefined;
    if (!control) {
      return;
    }
    if (control.invalid) {
      control.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Add single member from the form
    const { name, email } = control.value;
    this.addMemberToList({ name, email });

    // Close dialog and reset form state
    this.visible = false;
    this.memberForm.reset();
    this.membersFormArray.clear();
    this.isSubmitting = false;
  }

  removeExistingMember(member: GroupMember) {
    if (!this.groupId) return;
    this.groupsService.removeGroupMemberLocally(this.groupId, member.id);
    // Refresh local list
    this.groupsService
      .getGroupMembers(this.groupId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((members) => {
        this.members = members;
        this.selectedMember = null;
        this.removalSuccess = true;
        setTimeout(() => {
          this.removalSuccess = false;
        }, 3000);
      });
  }

  isDebtListEmpty(member: GroupMember): boolean {
    const isEmpty = (!member.owesTo || member.owesTo.length === 0)
                 && (!member.owedBy || member.owedBy.length === 0);
      return isEmpty;
  }

  selectMember(member: GroupMember): void {
    this.selectedMember = member;
  }


  isArrayFieldInvalid(i: number, field: string): boolean {
    const control = this.membersFormArray.at(i).get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Removed multi-row helpers for single-member add flow

  private addMemberToList(memberData: { name: string; email: string }): void {
    if (!this.groupId) return;

    const newMember: GroupMember = {
      id: this.getNextMemberId(),
      uid: this.generateTempUid(memberData.email), // Generate temporary UID
      name: memberData.name,
      email: memberData.email,
      avatar: `https://i.pravatar.cc/150?img=${this.members.length + 1}`, // Sample avatar
      balance: 0, // Default balance
      owesTo: [],
      owedBy: [],
      createdAt: new Date()
    };

    // Add to local members array
    this.members.push(newMember);
  }

  private generateTempUid(email: string): string {
    // Generate a temporary UID based on email and timestamp
    // This should be replaced with actual Firebase UID when user registers
    const timestamp = Date.now();
    const emailHash = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    return `temp-uid-${emailHash}-${timestamp}`;
  }

  private getNextMemberId(): number {
    if (this.members.length === 0) return 1;
    return Math.max(...this.members.map(m => m.id)) + 1;
  }

  // Chevron navigation methods
  scrollLeft(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({
        left: -ManageMembersComponent.SCROLL_DELTA,
        behavior: 'smooth'
      });
      setTimeout(() => this.updateScrollFlags(), ManageMembersComponent.UPDATE_FLAGS_DELAY_MS);
    }
  }

  scrollRight(): void {
    if (this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollBy({
        left: ManageMembersComponent.SCROLL_DELTA,
        behavior: 'smooth'
      });
      setTimeout(() => this.updateScrollFlags(), ManageMembersComponent.UPDATE_FLAGS_DELAY_MS);
    }
  }

  canScrollLeft(): boolean {
    return this.canScrollLeftFlag;
  }

  canScrollRight(): boolean {
    return this.canScrollRightFlag;
  }

  // Update flags on native scroll (mouse/trackpad) and resize
  onScroll(): void {
    this.updateScrollFlags();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollFlags();
  }

  private updateScrollFlags(): void {
    if (!this.scrollContainer) {
      this.canScrollLeftFlag = false;
      this.canScrollRightFlag = false;
      return;
    }

    const element = this.scrollContainer.nativeElement;
    const scrollLeft = element.scrollLeft;
    const scrollWidth = element.scrollWidth;
    const clientWidth = element.clientWidth;

    this.canScrollLeftFlag = scrollLeft > ManageMembersComponent.SCROLL_FLAG_EPSILON;
    this.canScrollRightFlag = scrollLeft < (scrollWidth - clientWidth - ManageMembersComponent.SCROLL_FLAG_EPSILON);
  }
}
