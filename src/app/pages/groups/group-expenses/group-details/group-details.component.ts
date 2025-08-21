import { Component, Input, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Message } from 'primeng/message';
import { GroupsService, Group } from '../../groups.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.scss'],
  standalone: true,
  imports: [CommonModule, ScrollPanelModule, SplitterModule, ButtonModule, Message]
})
export class GroupDetailsComponent implements OnInit {
  @Input() groupId?: string;
  @Input() isExpanded: boolean = false;
  @ViewChild('nameInput') nameInput!: ElementRef;
  group?: Group;

  isEditingDescription: boolean = false;
  previousDescription: string = '';
  get groupDescription(): string {
    return this.group?.description || '';
  }

  constructor(
    private groupsService: GroupsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.groupId) return;

    this.groupsService.getGroups().subscribe(groups => {
      this.group = groups.find(g => g.id === parseInt(this.groupId!));
    });
  }

  startDescriptionEdit(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.previousDescription = this.groupDescription;
    this.isEditingDescription = true;
    setTimeout(() => {
      this.nameInput?.nativeElement?.focus();
    });
  }

  saveGroupDescription(newDescription: string) {
    if (!this.isEditingDescription) {
      return;
    }

    if (!newDescription.trim() || !this.groupId) {
      this.cancelDescriptionEdit();
      return;
    }

    if (newDescription.trim() === this.previousDescription) {
      this.isEditingDescription = false;
      return;
    }

    const trimmedDescription = newDescription.trim();
    Promise.resolve().then(() => {
      if (!this.group) return;
      this.group.description = trimmedDescription;
      this.isEditingDescription = false;
      this.groupsService.updateGroupDescriptionLocally(Number(this.groupId), trimmedDescription);
      this.cdr.detectChanges();
    });
  }

  cancelDescriptionEdit() {
    if (!this.group) return;
    Promise.resolve().then(() => {
      if (!this.group) return;
      this.group.description = this.previousDescription;
      this.isEditingDescription = false;
      this.cdr.detectChanges();
    });
  }
}
