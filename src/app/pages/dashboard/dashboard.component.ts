import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from '../landing/components/topbarwidget.component';


@Component({
  selector: 'app-dashboard',
    standalone: true,
    imports: [RouterModule, TopbarWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
