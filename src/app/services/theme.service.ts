import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

const THEME_OVERRIDE_KEY = 'portfolio-theme-override';
const LIGHT_THEME_COLOR = '#eeeeee';
const DARK_THEME_COLOR = '#050505';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  init(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const override = sessionStorage.getItem(THEME_OVERRIDE_KEY);
    if (override === 'dark') {
      this.applyTheme(true);
      return;
    }

    if (override === 'light') {
      this.applyTheme(false);
      return;
    }

    this.syncWithSystemPreference();
  }

  toggleTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const willBeDark = !this.document.body.classList.contains('color-scheme-dark');
    sessionStorage.setItem(THEME_OVERRIDE_KEY, willBeDark ? 'dark' : 'light');
    this.applyTheme(willBeDark);
  }

  private syncWithSystemPreference(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (query: MediaQueryList | MediaQueryListEvent): void => {
      if (sessionStorage.getItem(THEME_OVERRIDE_KEY)) {
        return;
      }

      this.applyTheme(query.matches);
    };

    updateTheme(mediaQuery);
    mediaQuery.addEventListener('change', updateTheme);
  }

  private applyTheme(dark: boolean): void {
    const body = this.document.body;
    const root = this.document.documentElement;

    body.classList.toggle('color-scheme-dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    this.setThemeColor(dark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }

  private setThemeColor(color: string): void {
    const metas = this.document.head.querySelectorAll('meta[name="theme-color"]');

    if (metas.length === 0) {
      const meta = this.document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', color);
      this.document.head.appendChild(meta);
      return;
    }

    metas.forEach((meta) => meta.setAttribute('content', color));
  }
}
