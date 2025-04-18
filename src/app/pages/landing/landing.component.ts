import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';



@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, TopbarWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
