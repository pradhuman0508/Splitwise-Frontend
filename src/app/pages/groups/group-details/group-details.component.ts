import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { ButtonModule } from 'primeng/button';
import { Message } from 'primeng/message';
import { GroupsService, Group } from '../groups.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.scss'],
  standalone: true,
  imports: [CommonModule, SplitterModule, ButtonModule, Message]
})
export class GroupDetailsComponent implements OnInit {
  @Input() groupId?: string;
  @Input() isExpanded: boolean = false;
  group?: Group;

  isEditingDescription: boolean = false;
  previousDescription: string = '';
  get groupDescription(): string {
    return this.group?.description || '';
  }

  constructor(private groupsService: GroupsService) {}

  ngOnInit() {
    if (!this.groupId) return;

    this.groupsService.getGroups().subscribe(groups => {
      this.group = groups.find(g => g.id === parseInt(this.groupId!));
    });
  }

  startDescriptionEdit(event: Event) {
    // TODO: Implement description editing logic
    event.preventDefault();

    event.stopPropagation();
    this.previousDescription = this.groupDescription;
    this.isEditingDescription = true;
    // Focus the input element in the next tick
    setTimeout(() => {
      const input = document.querySelector('input') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }
}
