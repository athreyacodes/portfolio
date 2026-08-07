import { Component } from '@angular/core';

/** Fixed cloud wallpaper (portfolio-dev replica). Decorative only. */
@Component({
  selector: 'app-cloud-background',
  templateUrl: './cloud-background.html',
  styleUrl: './cloud-background.scss',
  host: {
    'aria-hidden': 'true'
  }
})
export class CloudBackgroundComponent {}
