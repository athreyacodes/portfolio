import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { getExperienceYears } from '../../../../core/experience';
import { I18nService, interpolate } from '../../../../core/i18n';
import { ThemeService } from '../../../../core/theme';
import { whileVisible } from '../../../../core/visibility';
import { Icon } from '../../../../shared/icon/icon';
import { Illustration } from '../../../../shared/illustration/illustration';

const SLIDE_KEYS = ['first', 'second', 'third'] as const;
const SLIDE_IMAGES = ['programmer', 'seo', 'ai'] as const;
const TICK_MS = 100;
const TICKS_PER_SLIDE = 100;

@Component({
  selector: 'app-skill-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Illustration],
  templateUrl: './skill-carousel.html',
  styleUrl: './skill-carousel.scss'
})
export class SkillCarousel {
  private readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private timer: ReturnType<typeof setInterval> | undefined;

  /** Whether autoplay should resume on scroll-back, i.e. the visitor's choice. */
  private wantsAutoplay = true;

  protected readonly copy = this.i18n.copy;
  protected readonly index = signal(0);
  protected readonly progress = signal(0);
  protected readonly playing = signal(false);

  protected readonly slides = computed(() => {
    const details = this.copy().skills.coding.details;
    const years = getExperienceYears();

    return SLIDE_KEYS.map((key, i) => {
      const slide = details[key];
      return {
        key,
        title: slide.title,
        image: SLIDE_IMAGES[i],
        imageAlt: slide.imageAlt,
        content1: interpolate(slide.content1, { years }),
        content2: slide.content2
      };
    });
  });

  constructor() {
    // This component only exists while the detail panel is open, so autoplay
    // belongs to its own lifecycle rather than to the parent's.
    whileVisible(
      () => {
        if (this.wantsAutoplay && !this.prefersReducedMotion()) {
          this.start();
        }
      },
      () => this.stop()
    );
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected goTo(index: number): void {
    this.index.set(index);
    this.progress.set(0);
    if (this.playing()) {
      this.restartTimer();
    }
  }

  /** Pressing play is explicit consent, so it overrides the motion preference. */
  protected toggleAutoplay(): void {
    this.wantsAutoplay = !this.playing();
    if (this.wantsAutoplay) {
      this.start();
    } else {
      this.stop();
    }
  }

  private start(): void {
    if (!this.isBrowser || this.playing()) {
      return;
    }
    this.playing.set(true);
    this.progress.set(0);
    this.restartTimer();
  }

  private stop(): void {
    clearInterval(this.timer);
    this.timer = undefined;
    this.playing.set(false);
    this.progress.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const total = SLIDE_KEYS.length;
    const current = this.index();
    let next: number | null = null;

    if (event.key === 'ArrowRight') {
      next = (current + 1) % total;
    } else if (event.key === 'ArrowLeft') {
      next = (current - 1 + total) % total;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = total - 1;
    }

    if (next === null) {
      return;
    }

    event.preventDefault();
    this.goTo(next);
    (event.currentTarget as HTMLElement)
      .querySelectorAll<HTMLElement>('[role="tab"]')
      [next]?.focus();
  }

  private restartTimer(): void {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      const next = this.progress() + 1;
      if (next >= TICKS_PER_SLIDE) {
        this.progress.set(0);
        this.index.update((i) => (i + 1) % SLIDE_KEYS.length);
      } else {
        this.progress.set(next);
      }
    }, TICK_MS);
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
