import { AvatarGroup } from 'primeng/avatargroup';
import { Avatar } from 'primeng/avatar';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsService, GroupMember } from '../../groups.service';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [CommonModule, Avatar, AvatarGroup,ScrollPanelModule],
  templateUrl: './manage-members.component.html',
  styleUrl: './manage-members.component.scss'
})
export class ManageMembersComponent implements OnInit {
  @Input() groupId!: string;
  @Input() isCardIIExpanded: boolean = false;
  members: GroupMember[] = [];

  constructor(private groupsService: GroupsService) {}

  ngOnInit() {
    if (this.groupId) {
      this.groupsService.getGroupMembers(Number(this.groupId)).subscribe((members) => {
        this.members = members;
      });
    }
  }
}
