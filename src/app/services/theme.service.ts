import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

/** Syncs UI with prefers-color-scheme. No manual override. */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private listening = false;

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.listening) {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = (query: MediaQueryList | MediaQueryListEvent): void => {
      this.apply(query.matches);
    };

    sync(media);
    media.addEventListener('change', sync);
    this.listening = true;
  }

  private apply(dark: boolean): void {
    const root = this.document.documentElement;
    root.classList.toggle('color-scheme-dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  }
}
