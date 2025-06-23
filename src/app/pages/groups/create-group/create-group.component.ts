import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from "primeng/floatlabel"
import { Router } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { AuthService } from '../../../core/auth.service';
import { getAuth, User } from '@angular/fire/auth';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';
import { GroupsService, Group } from '../groups.service';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [
    Dialog,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    Tooltip,
    FloatLabelModule,
    FileUploadModule,
    TextareaModule
  ],
  templateUrl: './create-group.component.html'
})
export class CreateGroupComponent implements OnInit {
  visible: boolean = false;
  groupForm: FormGroup;
  formErrors: string[] = [];
  isSubmitting = false;
  currentUser: User | null = null;
  selectedImage: string | null = null;
  imageFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private groupsService: GroupsService
  ) {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
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

  onImageSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.imageFile = file;
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imageFile = null;
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
      // Create the group object with the desired structure
      const group: Group = {
        id: this.groupsService.getNextId(),
        name: this.groupForm.value.name,
        description: this.groupForm.value.description || '',
        memberCount: this.members.length,
        balance: 0, // Initial balance
        totalExpenses: 0, // Initial expenses
        avatar: this.selectedImage || '', // Use the uploaded image URL
        createdAt: new Date() // Current date as the creation date
      };

      // Add the group through the service
      this.groupsService.addGroup(group);

      // Close dialog and reset form
      this.isSubmitting = false;
      this.visible = false;
      this.resetForm();
      console.log('Group created successfully:', group);
    } catch (error) {
      this.isSubmitting = false;
      this.formErrors.push('Failed to create group. Please try again.');
      console.error('Error creating group:', error);
    }
  }

  private resetForm() {
    this.groupForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      members: this.fb.array([])
    });
    
    // Reset image
    this.selectedImage = null;
    this.imageFile = null;
    
    // Re-add current user and empty member slots
    if (this.currentUser) {
      this.addCurrentUserAsMember();
    }
    this.addMember();
    this.addMember();
    
    this.formErrors = [];
  }
}
