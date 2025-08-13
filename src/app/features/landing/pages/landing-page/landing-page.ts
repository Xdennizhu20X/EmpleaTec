import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPageComponent {
}
