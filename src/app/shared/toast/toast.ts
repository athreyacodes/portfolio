import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../../core/i18n';
import { ToastService } from '../../core/toast';

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="toast-region"
      role="status"
      aria-live="polite"
      [attr.aria-label]="copy().a11y.notifications"
    >
      @if (message(); as text) {
        <p class="toast">{{ text }}</p>
      }
    </div>
  `,
  styleUrl: './toast.scss'
})
export class Toast {
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  protected readonly copy = this.i18n.copy;
  protected readonly message = this.toast.message;
}
