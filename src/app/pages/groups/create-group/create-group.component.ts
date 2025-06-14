import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { AuthService } from '../../../core/auth.service';
import { getAuth, User } from '@angular/fire/auth';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [
    Dialog,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule
  ],
  templateUrl: './create-group.component.html'
})
export class CreateGroupComponent implements OnInit {
  visible: boolean = false;
  groupForm: FormGroup;
  formErrors: string[] = [];
  isSubmitting = false;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      members: this.fb.array([])
    });
  }

  ngOnInit() {
    // Get current user
    const auth = getAuth();
    this.currentUser = auth.currentUser;
    
    if (this.currentUser) {
      // Add current user as hidden first member
      this.addCurrentUserAsMember();
    }
    
    // Add two empty member slots
    this.addMember();
    this.addMember();
  }

  get members(): FormArray {
    return this.groupForm.get('members') as FormArray;
  }

  openNewGroupModal(): void {
    this.visible = true;
  }

  createMember(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  addCurrentUserAsMember(): void {
    const memberGroup = this.fb.group({
      name: [this.currentUser?.displayName || 'Current User'],
      email: [this.currentUser?.email]
    });
    this.members.push(memberGroup);
  }

  addMember(): void {
    if (this.members.length < 10) {
      this.members.push(this.createMember());
    }
  }

  removeMember(index: number): void {
    if (index > 0) { // Extra safety check
      this.members.removeAt(index);
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.groupForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isArrayFieldInvalid(i: number, field: string): boolean {
    const control = this.members.at(i).get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getArrayErrorMessage(i: number, field: string): string {
    const control = this.members.at(i).get(field);
    if (control?.hasError('email')) return 'Invalid email format';
    return '';
  }

  onSubmit() {
    this.formErrors = [];
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      this.formErrors.push('Please fix the errors before submitting.');
      return;
    }

    if (this.members.length < 2) { // At least current user + 1 more member
      this.formErrors.push('Please add at least one member to the group.');
      return;
    }

    this.isSubmitting = true;

    try {
      // Get the form value including the current user
      const formValue = {
        ...this.groupForm.value,
        members: this.members.getRawValue()
      };

      // Simulate API call
      setTimeout(() => {
        // On success:
        this.isSubmitting = false;
        this.visible = false; // Close the dialog
        this.resetForm();
        console.log('Group created successfully:', formValue);
      }, 1500);
    } catch (error) {
      this.isSubmitting = false;
      this.formErrors.push('Failed to create group. Please try again.');
      console.error('Error creating group:', error);
    }
  }

  private resetForm() {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      members: this.fb.array([])
    });
    
    // Re-add current user and empty member slots
    if (this.currentUser) {
      this.addCurrentUserAsMember();
    }
    this.addMember();
    this.addMember();
    
    this.formErrors = [];
  }
}
