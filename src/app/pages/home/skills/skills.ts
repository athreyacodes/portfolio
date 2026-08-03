import { Component, computed, inject } from '@angular/core';
import { LanguageService, LocaleCode } from '../../../services/language.service';
import { ThemeService, ThemeMode } from '../../../services/theme.service';

@Component({
  selector: 'app-skills',
  imports: [],
  templateUrl: './skills.html',
  styleUrl: './skills.scss'
})
export class SkillsComponent {
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  protected readonly copy = this.languageService.copy;
  protected readonly locale = this.languageService.locale;
  protected readonly isDark = this.themeService.isDark;

  protected readonly illustrationFolder = computed(() =>
    this.isDark() ? 'theme-dark' : 'theme-light'
  );

  protected imageSrc(fileName: string): string {
    return `images/illustrations/${this.illustrationFolder()}/${fileName}`;
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
