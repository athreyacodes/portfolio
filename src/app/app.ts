import { Component, signal, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('portfolio');

  constructor() {
    afterNextRender(() => {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const updateTheme = (query: MediaQueryList | MediaQueryListEvent) => {
        if (query.matches) {
          document.body.classList.add('color-scheme-dark');
        } else {
          document.body.classList.remove('color-scheme-dark');
        }
      };
      
      // Perform initial sync on hydration
      updateTheme(mediaQuery);

      // Listen for system/browser theme updates dynamically
      try {
        mediaQuery.addEventListener('change', updateTheme);
      } catch (e) {
        try {
          mediaQuery.addListener(updateTheme);
        } catch (e2) {}
      }
    });
  }
}
