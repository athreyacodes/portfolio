import { Component, computed, inject, input } from '@angular/core';
import { LanguageService, LocaleCode } from '../../../services/language.service';
import { ThemeService, ThemeMode } from '../../../services/theme.service';

type SkillCard = ReturnType<LanguageService['copy']>['skills']['cards'][number];

@Component({
  selector: 'app-skills',
  imports: [],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class SkillsComponent {
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  /** Parent drives reveal after the hero subtitle fades in. */
  readonly visible = input(true);

  protected readonly copy = this.languageService.copy;
  protected readonly locale = this.languageService.locale;
  protected readonly isDark = this.themeService.isDark;

  protected readonly primaryCard = computed(
    () => this.copy().skills.cards.find((card) => card.variant === 'primary') ?? null
  );

  protected readonly secondaryCards = computed(() =>
    this.copy().skills.cards.filter((card) => card.variant !== 'primary')
  );

  protected readonly illustrationFolder = computed(() =>
    this.isDark() ? 'theme-dark' : 'theme-light'
  );

  protected imageSrc(fileName: string): string {
    return `images/illustrations/${this.illustrationFolder()}/${fileName}`;
  }

  protected hasThemes(
    card: SkillCard
  ): card is SkillCard & { themes: { id: string; label: string }[]; themeHint: string } {
    return 'themes' in card && Array.isArray(card.themes);
  }

  protected hasLanguages(
    card: SkillCard
  ): card is SkillCard & { languages: { id: string; label: string }[]; languageHint: string } {
    return 'languages' in card && Array.isArray(card.languages);
  }

  protected setTheme(mode: string): void {
    if (mode === 'light' || mode === 'dark') {
      this.themeService.setTheme(mode as ThemeMode);
    }
  }

  protected setLocale(code: string): void {
    this.languageService.setLocale(code as LocaleCode);
  }

  protected isThemeActive(id: string): boolean {
    return id === 'dark' ? this.isDark() : !this.isDark();
  }

  protected isLocaleActive(id: string): boolean {
    return this.locale() === id;
  }
}
