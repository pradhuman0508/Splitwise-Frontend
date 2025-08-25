import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [
    Dialog,
    ButtonModule
  ],
  templateUrl: './member-details.component.html'
})
export class MemberDetailsComponent {
  visible: boolean = false;

  openNewGroupModal(): void {
    this.visible = true;
  }
}
