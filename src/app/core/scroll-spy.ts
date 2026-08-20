import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type SectionId = 'home' | 'skills' | 'experience';

export const SECTION_IDS: readonly SectionId[] = ['home', 'skills', 'experience'];

/**
 * Tracks which section is in view. Uses IntersectionObserver rather than a
 * scroll listener so nothing runs on the main thread between intersections.
 */
@Injectable({ providedIn: 'root' })
export class ScrollSpyService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private observer: IntersectionObserver | undefined;

  readonly active = signal<SectionId>('home');
  readonly scrolled = signal(false);

  observe(): () => void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      return () => undefined;
    }

    const ratios = new Map<SectionId, number>();

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(
            entry.target.id as SectionId,
            entry.isIntersecting ? entry.intersectionRatio : 0
          );
        }

        let best: SectionId = this.active();
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }

        if (bestRatio > 0) {
          this.active.set(best);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    for (const id of SECTION_IDS) {
      const element = this.document.getElementById(id);
      if (element) {
        this.observer.observe(element);
      }
    }

    const onScroll = () => this.scrolled.set(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      this.observer?.disconnect();
      this.observer = undefined;
      window.removeEventListener('scroll', onScroll);
    };
  }

  scrollTo(id: SectionId): void {
    if (!this.isBrowser) {
      return;
    }

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: this.scrollBehavior() });
      return;
    }

    const target =
      id === 'skills'
        ? (this.document.getElementById('skills-heading') ?? this.document.getElementById(id))
        : this.document.getElementById(id);

    if (!target) {
      return;
    }

    const offsetPx = id === 'skills' ? 32 : 24;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offsetPx);
    window.scrollTo({ top, behavior: this.scrollBehavior() });
  }

  private scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }
}
