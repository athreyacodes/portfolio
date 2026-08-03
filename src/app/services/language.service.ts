import { Injectable, computed, signal } from '@angular/core';
import meData from '../data/me.json';

export type LocaleCode = keyof typeof meData.locales;

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly localeSignal = signal<LocaleCode>('en');

  readonly locale = this.localeSignal.asReadonly();
  readonly copy = computed(() => meData.locales[this.localeSignal()]);

  setLocale(code: LocaleCode): void {
    if (code in meData.locales) {
      this.localeSignal.set(code);
    }
  }
}
