import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../../core/i18n';

/**
 * The LCP element. Dimensions are fixed to reserve layout space, and the
 * source set is preloaded from index.html so the fetch starts with the HTML.
 */
@Component({
  selector: 'app-profile-photo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <picture>
      <source
        type="image/avif"
        srcset="/images/dp-240.avif 240w, /images/dp-480.avif 480w"
        sizes="(max-width: 820px) 160px, 240px"
      />
      <source
        type="image/webp"
        srcset="/images/dp-240.webp 240w, /images/dp-480.webp 480w"
        sizes="(max-width: 820px) 160px, 240px"
      />
      <img
        src="/images/dp-480.jpg"
        srcset="/images/dp-240.jpg 240w, /images/dp-480.jpg 480w"
        sizes="(max-width: 820px) 160px, 240px"
        width="480"
        height="480"
        [alt]="copy().a11y.profileAlt"
        fetchpriority="high"
        decoding="sync"
      />
    </picture>
  `,
  styleUrl: './profile-photo.scss'
})
export class ProfilePhoto {
  private readonly i18n = inject(I18nService);
  protected readonly copy = this.i18n.copy;
}
