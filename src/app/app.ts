import { Component, inject, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { CloudBackgroundComponent } from './components/cloud-background/cloud-background';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CloudBackgroundComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly themeService = inject(ThemeService);

  constructor() {
    afterNextRender(() => {
      this.themeService.init();
    });
  }
}
