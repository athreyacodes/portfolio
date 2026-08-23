import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { getExperienceYears } from '../../../core/experience';
import { I18nService, LOCALES, LocaleCode, interpolate } from '../../../core/i18n';
import { SEO_REPORT_FILENAME, SEO_REPORT_URL } from '../../../core/links';
import { ScrollSpyService } from '../../../core/scroll-spy';
import { ThemeMode, ThemeService } from '../../../core/theme';
import { ToastService } from '../../../core/toast';
import { CardDeck } from '../../../shared/card-deck/card-deck';
import { Icon } from '../../../shared/icon/icon';
import { Illustration } from '../../../shared/illustration/illustration';

const THEME_MODES: readonly ThemeMode[] = ['light', 'dark'];

const SKILL_CARDS = [
  { key: 'first', image: 'programmer' },
  { key: 'second', image: 'seo' },
  { key: 'third', image: 'ai' }
] as const;

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardDeck, Icon, Illustration],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class Skills {
  private readonly i18n = inject(I18nService);
  private readonly themeService = inject(ThemeService);
  private readonly scrollSpy = inject(ScrollSpyService);
  private readonly toast = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sanitizer = inject(DomSanitizer);

  readonly band = input<'architecture' | 'craft'>('architecture');

  private readonly seoDialog = viewChild<ElementRef<HTMLElement>>('seoDialog');
  private seoReportTrigger: HTMLElement | null = null;
  private bodyOverflow = '';
  private rootOverflow = '';

  protected readonly copy = this.i18n.copy;
  protected readonly locales = LOCALES;
  protected readonly themes = THEME_MODES;
  protected readonly activeLocale = this.i18n.locale;
  protected readonly activeTheme = this.themeService.theme;
  protected readonly seoReportUrl = SEO_REPORT_URL;
  protected readonly seoReportFilename = SEO_REPORT_FILENAME;
  protected readonly seoReportSrc = this.sanitizer.bypassSecurityTrustResourceUrl(SEO_REPORT_URL);
  protected readonly seoReportOpen = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.unlockPageScroll());
  }

  protected readonly skillCards = computed(() => {
    const details = this.copy().skills.coding.details;
    const years = getExperienceYears();

    return SKILL_CARDS.map(({ key, image }) => {
      const slide = details[key];
      return {
        key,
        image,
        title: slide.title.replace(/^\d+\.\s*/, ''),
        imageAlt: slide.imageAlt,
        content1: interpolate(slide.content1, { years }),
        content2: slide.content2
      };
    });
  });

  protected themeLabel(mode: ThemeMode): string {
    return this.copy().theme[mode].label;
  }

  protected selectTheme(mode: ThemeMode): void {
    if (mode === this.activeTheme()) {
      return;
    }
    this.themeService.setTheme(mode);
    this.toast.show(
      interpolate(this.copy().global.themeUpdated, { theme: this.themeLabel(mode) })
    );
  }

  protected async selectLocale(code: LocaleCode): Promise<void> {
    if (code === this.activeLocale()) {
      return;
    }
    const name = LOCALES.find((locale) => locale.code === code)?.name ?? code;
    await this.i18n.setLocale(code);
    this.toast.show(interpolate(this.copy().global.languageUpdated, { language: name }));
  }

  protected onCraftClick(event: MouseEvent): void {
    this.scrollSpy.handleNavClick(event, 'craft');
  }

  protected onExperienceClick(event: MouseEvent): void {
    this.scrollSpy.handleNavClick(event, 'experience');
  }

  protected openSeoReport(event: MouseEvent): void {
    this.seoReportTrigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
    this.lockPageScroll();
    this.seoReportOpen.set(true);
    queueMicrotask(() => {
      this.seoDialog()
        ?.nativeElement.querySelector<HTMLElement>('button, [href]')
        ?.focus();
    });
  }

  protected closeSeoReport(): void {
    this.seoReportOpen.set(false);
    this.unlockPageScroll();
    queueMicrotask(() => this.seoReportTrigger?.focus());
  }

  private lockPageScroll(): void {
    if (!this.isBrowser || this.seoReportOpen()) {
      return;
    }
    const { body, documentElement } = this.document;
    this.bodyOverflow = body.style.overflow;
    this.rootOverflow = documentElement.style.overflow;
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
  }

  private unlockPageScroll(): void {
    if (!this.isBrowser) {
      return;
    }
    const { body, documentElement } = this.document;
    body.style.overflow = this.bodyOverflow;
    documentElement.style.overflow = this.rootOverflow;
  }

  protected onSeoReportKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeSeoReport();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const panel = this.seoDialog()?.nativeElement;
    if (!panel) {
      return;
    }

    const focusable = Array.from(panel.querySelectorAll<HTMLElement>('button, [href]'));
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
