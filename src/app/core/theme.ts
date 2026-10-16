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

    const mode = this.initialTheme();
    this.apply(mode);
    if (this.readCookie() ?? this.readStoredTheme()) {
      this.persist(mode);
    }
  }

  private initialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    const stored = this.readCookie() ?? this.readStoredTheme();
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
    this.syncThemeColor();
  }

  /**
   * iOS Safari tints the status bar and toolbar from `theme-color`. The static
   * media queries follow the OS, so a manual site theme would otherwise leave
   * the chrome on the wrong colour.
   */
  private syncThemeColor(): void {
    const color = getComputedStyle(this.document.documentElement)
      .getPropertyValue('--background')
      .trim();

    if (!color) {
      return;
    }

    for (const meta of Array.from(this.document.querySelectorAll('meta[name="theme-color"]'))) {
      meta.remove();
    }

    const meta = this.document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    this.document.head.appendChild(meta);
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

    const hostname = this.document.location.hostname;
    const domain =
      hostname === 'athreya.codes' || hostname.endsWith('.athreya.codes') ? '; Domain=.athreya.codes' : '';
    const secure = this.document.location.protocol === 'https:' ? '; Secure' : '';
    this.document.cookie = `${STORAGE_KEY}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax${domain}${secure}`;
  }

  private readCookie(): ThemeMode | null {
    const match = this.document.cookie.match(/(?:^|; )portfolio\.theme=(light|dark)(?:;|$)/);
    return match?.[1] === 'light' || match?.[1] === 'dark' ? match[1] : null;
  }
}
