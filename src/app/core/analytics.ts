import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * GA4 measurement ID (`G-XXXXXXXXXX`) for the `portfolio-f2684` project.
 * Empty string keeps analytics off and ships no tag code at all.
 */
export const GA_MEASUREMENT_ID = '';

/**
 * The Firebase JS SDK used to be imported at module scope, which pulled the
 * whole SDK into the initial bundle and ran before first paint. A plain gtag
 * snippet does the same job, loaded from a lazy chunk once the browser is idle.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private loaded = false;

  init(): void {
    if (!this.isBrowser || !GA_MEASUREMENT_ID || this.loaded) {
      return;
    }

    this.loaded = true;
    this.whenIdle(() => {
      void import('./gtag').then(({ loadGtag }) =>
        loadGtag(GA_MEASUREMENT_ID, this.document)
      );
    });
  }

  private whenIdle(callback: () => void): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout: 5000 });
    } else {
      setTimeout(callback, 3000);
    }
  }
}
