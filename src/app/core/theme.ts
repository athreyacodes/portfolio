import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'portfolio.theme';
const DARK_CLASS = 'theme-dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Resolved eagerly rather than in `restore()`: theme-paired assets bind to
   * this during the very first client render, and a late correction would cost
   * a second image download.
   */
  private readonly current = signal<ThemeMode>(this.initialTheme());
  readonly theme = this.current.asReadonly();

  /**
   * Picks up whatever the inline head script already applied, so hydration does
   * not flip the theme back to the server-rendered default.
   */
  restore(): void {
    if (!this.isBrowser) {
      return;
    }

    this.apply(this.initialTheme());
  }

  private initialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    const stored = this.readStoredTheme();
    return stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  setTheme(mode: ThemeMode): void {
    this.apply(mode);
    this.persist(mode);
  }

  private apply(mode: ThemeMode): void {
    this.current.set(mode);

    if (!this.isBrowser) {
      return;
    }

    const root = this.document.documentElement;
    root.classList.toggle(DARK_CLASS, mode === 'dark');
    root.style.colorScheme = mode;
  }

  private readStoredTheme(): ThemeMode | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private persist(mode: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable (private mode) — preference is simply not remembered */
    }
  }
}
