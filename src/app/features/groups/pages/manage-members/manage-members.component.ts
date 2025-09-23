import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { GroupsService, GroupMember } from '../../../../features/groups/services/groups.service';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [CommonModule, FloatLabelModule, ScrollPanelModule, ButtonModule, ReactiveFormsModule, InputTextModule, TooltipModule],
  templateUrl: './manage-members.component.html',
  styleUrls: ['../group.component.scss', './manage-members.component.scss']
})
export class ManageMembersComponent implements OnInit {
  groupId!: string;
  members: GroupMember[] = [];
  memberForm: FormGroup;
  selectedMember: GroupMember | null = null;
  removalSuccess = false;

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
    this.groupId = parentId || selfId || '';

    if (this.groupId) {
      this.groupsService.getGroupMembers(Number(this.groupId)).subscribe({
        next: (members) => {
          this.members = members || [];
        },
        error: (error) => {
          console.error('Error fetching members:', error);
        }
      });
    }
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else if (this.groupId) {
      this.router.navigate(['/group', this.groupId]);
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

  removeMember(index: number): void {
    if (index >= 0) {
      this.membersFormArray.removeAt(index);
    }
  }

  removeExistingMember(member: GroupMember) {
    if (!this.groupId) return;
    this.groupsService.removeGroupMemberLocally(Number(this.groupId), member.id);
    // Refresh local list
    this.groupsService.getGroupMembers(Number(this.groupId)).subscribe((members) => {
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

  getArrayErrorMessage(i: number, field: string): string {
    const control = this.membersFormArray.at(i).get(field);
    if (control?.hasError('email')) return 'Invalid email format';
    if (control?.hasError('required')) return 'This field is required';
    return '';
  }

  onFormSubmit(): void {
    if (this.memberForm.valid) {
      this.addFormMembersToList();
    }
  }

  onFieldBlur(index: number): void {
    const memberControl = this.membersFormArray.at(index);
    if (memberControl.valid && memberControl.value.name && memberControl.value.email) {
      // Add this member to the list
      this.addMemberToList(memberControl.value);
      // Remove the form control
      this.membersFormArray.removeAt(index);
    }
  }

  onFieldKeyPress(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const memberControl = this.membersFormArray.at(index);
      if (memberControl.valid && memberControl.value.name && memberControl.value.email) {
        // Add this member to the list
        this.addMemberToList(memberControl.value);
        // Remove the form control
        this.membersFormArray.removeAt(index);
      }
    }
  }

  private addFormMembersToList(): void {
    const formMembers = this.memberForm.value.members;
    formMembers.forEach((member: any) => {
      if (member.name && member.email) {
        this.addMemberToList(member);
      }
    });
    // Clear the form
    this.membersFormArray.clear();
  }

  private addMemberToList(memberData: { name: string; email: string }): void {
    if (!this.groupId) return;

    const newMember: GroupMember = {
      id: this.getNextMemberId(),
      uid: this.generateTempUid(memberData.email), // Generate temporary UID
      name: memberData.name,
      email: memberData.email,
      avatar: '', // Default empty avatar
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
}
