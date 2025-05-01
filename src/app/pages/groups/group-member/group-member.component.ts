import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-group-member',
  standalone: true,
  imports: [
    CommonModule,
    AvatarModule,
    ButtonModule,
    TooltipModule,
    TableModule,
    DialogModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './group-member.component.html',
  styleUrl: './group-member.component.scss'
})
export class GroupMemberComponent implements OnInit {
  @Input() groupId: number = 0;
  @Input() members: any[] = [];

  showAddMemberDialog: boolean = false;
  newMemberEmail: string = '';

  constructor() {}

  ngOnInit(): void {}

  openAddMemberDialog(): void {
    this.showAddMemberDialog = true;
    this.newMemberEmail = '';
}

  addMember(): void {
    // In a real app, this would call the service
    console.log('Adding member with email:', this.newMemberEmail);
    this.showAddMemberDialog = false;
    // Show success message
  }

  removeMember(memberId: number): void {
    // Confirmation dialog would be shown in real app
    console.log('Remove member with ID:', memberId);
  }
}
