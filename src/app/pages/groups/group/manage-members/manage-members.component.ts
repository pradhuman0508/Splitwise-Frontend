import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { GroupsService, GroupMember } from '../../groups.service';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { InputTextModule } from 'primeng/inputtext';
import { CreateGroupComponent } from '../../create-group/create-group.component';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [CommonModule, FloatLabelModule, ScrollPanelModule, ButtonModule, ReactiveFormsModule, InputTextModule],
  templateUrl: './manage-members.component.html',
  styleUrls: ['../group.component.scss']
})
export class ManageMembersComponent implements OnInit {
  @Input() groupId!: string;
  @Input() isIIExpanded: boolean = false;
  members: GroupMember[] = [];
  memberForm: FormGroup;

  constructor(
    private groupsService: GroupsService,
    private fb: FormBuilder
  ) {
    this.memberForm = this.fb.group({
      members: this.fb.array([])
    });
  }

  ngOnInit() {
    if (this.groupId) {
      this.groupsService.getGroupMembers(Number(this.groupId)).subscribe((members) => {
        this.members = members;
        // Sort existing members by creation time (newest first)
        this.sortMembersByCreationTime();
      });
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
    });
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
      name: memberData.name,
      email: memberData.email,
      avatar: '', // Default empty avatar
      balance: 0, // Default balance
      owesTo: [],
      owedBy: [],
      createdAt: new Date() // Add timestamp for sorting
    };

    // Add to local members array
    this.members.push(newMember);
    
    // Sort members by creation time (newest first)
    this.sortMembersByCreationTime();
    
    // Here you would typically also call a service method to persist the member
    // this.groupsService.addGroupMember(Number(this.groupId), newMember);
    
    console.log('Member added:', newMember);
  }

  private getNextMemberId(): number {
    if (this.members.length === 0) return 1;
    return Math.max(...this.members.map(m => m.id)) + 1;
  }

  private sortMembersByCreationTime(): void {
    this.members.sort((a, b) => {
      // Sort by createdAt timestamp (newest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // If no timestamp, keep original order
      return 0;
    });
  }
}
