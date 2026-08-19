import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  output,
  viewChild
} from '@angular/core';

import { I18nService, LOCALES, LocaleCode, interpolate } from '../../core/i18n';
import { ScrollSpyService, SectionId } from '../../core/scroll-spy';
import { ThemeMode, ThemeService } from '../../core/theme';
import { ToastService } from '../../core/toast';
import { CV_FILENAME, CV_URL } from '../../core/links';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu implements AfterViewInit {
  private readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);
  private readonly scrollSpy = inject(ScrollSpyService);
  private readonly toast = inject(ToastService);

  readonly closed = output<void>();

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected readonly copy = this.i18n.copy;
  protected readonly scrolled = this.scrollSpy.scrolled;
  protected readonly cvUrl = CV_URL;
  protected readonly cvFilename = CV_FILENAME;

  protected readonly otherLocales = computed(() =>
    LOCALES.filter((locale) => locale.code !== this.i18n.locale())
  );

  protected readonly otherThemes = computed<ReadonlyArray<ThemeMode>>(() =>
    this.theme.theme() === 'dark' ? ['light'] : ['dark']
  );

  ngAfterViewInit(): void {
    this.panel()
      .nativeElement.querySelector<HTMLElement>('button, [href]')
      ?.focus();
  }

  protected themeLabel(mode: ThemeMode): string {
    return this.copy().theme[mode].longLabel;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(
      this.panel().nativeElement.querySelectorAll<HTMLElement>('button, [href]')
    );
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

  protected goTo(section: SectionId): void {
    this.scrollSpy.scrollTo(section);
    this.close();
  }

  protected async selectLocale(code: LocaleCode): Promise<void> {
    const name = LOCALES.find((locale) => locale.code === code)?.name ?? code;
    this.close();
    await this.i18n.setLocale(code);
    this.toast.show(interpolate(this.copy().global.languageUpdated, { language: name }));
  }

  protected selectTheme(mode: ThemeMode): void {
    const label = this.copy().theme[mode].label;
    this.theme.setTheme(mode);
    this.close();
    this.toast.show(interpolate(this.copy().global.themeUpdated, { theme: label }));
  }

  protected close(): void {
    this.closed.emit();
  }
}
