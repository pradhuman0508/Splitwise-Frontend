import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule,NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {

}
