import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

/** Applies light/dark UI. Manual override wins until switched back to system. */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private media: MediaQueryList | null = null;
  private listening = false;

  readonly mode = signal<ThemeMode>('system');
  readonly isDark = signal(false);

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.listening) {
      return;
    }

    this.media = window.matchMedia('(prefers-color-scheme: dark)');
    this.media.addEventListener('change', () => {
      if (this.mode() === 'system') {
        this.apply(this.media!.matches);
      }
    });
    this.resolve();
    this.listening = true;
  }

  setTheme(mode: ThemeMode): void {
    this.mode.set(mode);
    this.resolve();
  }

  private resolve(): void {
    const mode = this.mode();
    if (mode === 'system') {
      this.apply(this.media?.matches ?? false);
      return;
    }
    this.apply(mode === 'dark');
  }

  private apply(dark: boolean): void {
    this.isDark.set(dark);
    const root = this.document.documentElement;
    root.classList.toggle('color-scheme-dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
  }
}
