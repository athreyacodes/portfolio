import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../core/i18n';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFound {
  private readonly i18n = inject(I18nService);
  protected readonly copy = this.i18n.copy;
}
