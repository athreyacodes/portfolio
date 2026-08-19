import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AnalyticsService } from './core/analytics';
import { I18nService } from './core/i18n';
import { ThemeService } from './core/theme';
import { Background } from './layout/background/background';
import { Toast } from './shared/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Background, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly i18n = inject(I18nService);
  private readonly analytics = inject(AnalyticsService);

  protected readonly copy = this.i18n.copy;

  constructor() {
    // Stored preferences are applied after hydration so the restored values
    // never conflict with the prerendered markup.
    afterNextRender(() => {
      this.theme.restore();
      this.i18n.restore();
      this.analytics.init();
    });
  }
}
