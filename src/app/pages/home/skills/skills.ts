import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { I18nService, LOCALES, LocaleCode, interpolate } from '../../../core/i18n';
import { ScrollSpyService } from '../../../core/scroll-spy';
import { ThemeMode, ThemeService } from '../../../core/theme';
import { ToastService } from '../../../core/toast';
import { Icon } from '../../../shared/icon/icon';
import { Illustration } from '../../../shared/illustration/illustration';
import { SkillCarousel } from './skill-carousel/skill-carousel';

const THEME_MODES: readonly ThemeMode[] = ['light', 'dark'];

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Illustration, SkillCarousel],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class Skills {
  private readonly i18n = inject(I18nService);
  private readonly themeService = inject(ThemeService);
  private readonly scrollSpy = inject(ScrollSpyService);
  private readonly toast = inject(ToastService);

  protected readonly copy = this.i18n.copy;
  protected readonly locales = LOCALES;
  protected readonly themes = THEME_MODES;
  protected readonly activeLocale = this.i18n.locale;
  protected readonly activeTheme = this.themeService.theme;
  protected readonly detailsOpen = signal(false);

  protected toggleDetails(open: boolean): void {
    this.detailsOpen.set(open);
  }

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

  protected goToExperience(): void {
    this.scrollSpy.scrollTo('experience');
  }
}
