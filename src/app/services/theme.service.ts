import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

const THEME_OVERRIDE_KEY = 'portfolio-theme-override';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const override = sessionStorage.getItem(THEME_OVERRIDE_KEY);
    if (override === 'dark') {
      this.document.body.classList.add('color-scheme-dark');
      return;
    }

    if (override === 'light') {
      this.document.body.classList.remove('color-scheme-dark');
      return;
    }

    this.syncWithSystemPreference();
  }

  toggleTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = this.document.body;
    const willBeDark = !body.classList.contains('color-scheme-dark');

    if (willBeDark) {
      body.classList.add('color-scheme-dark');
      sessionStorage.setItem(THEME_OVERRIDE_KEY, 'dark');
    } else {
      body.classList.remove('color-scheme-dark');
      sessionStorage.setItem(THEME_OVERRIDE_KEY, 'light');
    }
  }

  private syncWithSystemPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (query: MediaQueryList | MediaQueryListEvent): void => {
      if (sessionStorage.getItem(THEME_OVERRIDE_KEY)) {
        return;
      }

      if (query.matches) {
        this.document.body.classList.add('color-scheme-dark');
      } else {
        this.document.body.classList.remove('color-scheme-dark');
      }
    };

    updateTheme(mediaQuery);

    try {
      mediaQuery.addEventListener('change', updateTheme);
    } catch {
      mediaQuery.addListener(updateTheme);
    }
  }
}
