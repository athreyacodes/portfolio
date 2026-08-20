import { DOCUMENT, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import enGb from '../data/i18n/en-gb.json';

export type Copy = typeof enGb;
export type LocaleCode = 'en-gb' | 'fr-fr';

export const DEFAULT_LOCALE: LocaleCode = 'en-gb';

export const LOCALES: ReadonlyArray<{ code: LocaleCode; short: string; name: string }> = [
  { code: 'en-gb', short: 'EN', name: 'English' },
  { code: 'fr-fr', short: 'FR', name: 'Français' }
];

const STORAGE_KEY = 'portfolio.locale';

/**
 * English ships in the main bundle so prerendered HTML carries real copy for
 * crawlers; other locales are code-split and fetched only when selected.
 */
const LOADERS: Record<Exclude<LocaleCode, 'en-gb'>, () => Promise<{ default: Copy }>> = {
  'fr-fr': () => import('../data/i18n/fr-fr.json')
};

export function interpolate(
  template: string,
  params: Record<string, string | number> = {}
): string {
  return Object.entries(params).reduce(
    (result, [token, value]) => result.replaceAll(`{${token}}`, String(value)),
    template
  );
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly dictionaries = signal<Partial<Record<LocaleCode, Copy>>>({ 'en-gb': enGb });
  private readonly current = signal<LocaleCode>(DEFAULT_LOCALE);

  readonly locale = this.current.asReadonly();
  readonly copy = computed<Copy>(() => this.dictionaries()[this.current()] ?? enGb);

  restore(): void {
    if (!this.isBrowser) {
      return;
    }

    const stored = this.readStoredLocale();
    if (stored && stored !== DEFAULT_LOCALE) {
      void this.setLocale(stored);
    }
  }

  async setLocale(code: LocaleCode): Promise<void> {
    if (code === this.current() && this.dictionaries()[code]) {
      return;
    }

    if (!this.dictionaries()[code]) {
      const loader = LOADERS[code as Exclude<LocaleCode, 'en-gb'>];
      if (!loader) {
        return;
      }
      const module = await loader();
      this.dictionaries.update((all) => ({ ...all, [code]: module.default }));
    }

    this.current.set(code);
    this.syncDocumentLang();
    this.persist(code);
  }

  private syncDocumentLang(): void {
    this.document.documentElement.lang = this.copy().language.htmlLang;
  }

  private readStoredLocale(): LocaleCode | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
      return value && LOCALES.some((locale) => locale.code === value) ? value : null;
    } catch {
      return null;
    }
  }

  private persist(code: LocaleCode): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable (private mode) — preference is simply not remembered */
    }
  }
}
