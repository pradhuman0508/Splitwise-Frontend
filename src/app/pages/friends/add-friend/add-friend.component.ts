import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-friend',
  standalone: true,
  imports: [
    Dialog,
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  templateUrl: './add-friend.component.html',
  styleUrl: './add-friend.component.scss'
})
export class AddFriendComponent {
  text1: string | undefined;
  visible: boolean = false;
  friendForm: FormGroup;
  isSubmitting = false;
  formErrors: string[] = [];
  emailList: string[] = [];

  constructor(private fb: FormBuilder, private router: Router) {
    this.friendForm = this.fb.group({
      email: ['']
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  handleEmailInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (event.key === 'Enter' && value) {
      event.preventDefault(); // Prevent form submission on Enter
      if (this.isValidEmail(value)) {
        this.emailList.push(value);
        this.friendForm.get('email')?.setValue('');
      }
    }
  }

  removeEmail(index: number) {
    this.emailList.splice(index, 1);
  }

  onSubmit() {
    this.formErrors = [];
    
    // Check if there's a valid email in the input field
    const currentEmail = this.friendForm.get('email')?.value?.trim();
    if (currentEmail && this.isValidEmail(currentEmail)) {
      this.emailList.push(currentEmail);
      this.friendForm.get('email')?.setValue('');
    }

    if (this.emailList.length === 0) {
      this.formErrors.push('Please add at least one email address.');
      return;
    }

    this.isSubmitting = true;

    // Simulate API
    setTimeout(() => {
      console.log('Inviting friends:', this.emailList);
      this.isSubmitting = false;
      this.visible = false;
      this.emailList = [];
    }, 1500);
  }
}
