import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import meData from '../../data/me.json';
import { LanguageService } from '../../services/language.service';
import { SkillsComponent } from './skills/skills';

/** 0 = boot, 1 = photo + card + name, 2 = dock left + role, 3 = subtitle fade */
export type HeroIntroPhase = 0 | 1 | 2 | 3;

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, MatTooltipModule, SkillsComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  // SSR/prerender ships the final hero (phase 3). Client rebuilds and plays the intro.
  host: { ngSkipHydration: 'true' }
})
export class HomeComponent {
  private readonly languageService = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heroLeft = viewChild.required<ElementRef<HTMLElement>>('heroLeft');

  protected readonly me = meData;
  protected readonly copy = this.languageService.copy;
  protected readonly copyFeedback = signal('');
  /**
   * When false, all intro transitions are disabled so the SSR final state can
   * snap to boot without animating backwards on refresh.
   */
  protected readonly introLive = signal(!isPlatformBrowser(this.platformId));
  /** Fades the hero in after the cold boot snap (hides SSR → boot flicker). */
  protected readonly introVisible = signal(!isPlatformBrowser(this.platformId));
  /** Server/prerender: fully visible for SEO. Browser: boot at 0 and animate. */
  protected readonly introPhase = signal<HeroIntroPhase>(
    isPlatformBrowser(this.platformId) ? 0 : 3
  );

  private introTimers: number[] = [];

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.startIntro();

      // bfcache restore can leave the page on the final frame — replay cleanly
      const onPageShow = (event: PageTransitionEvent): void => {
        if (event.persisted) {
          this.startIntro();
        }
      };
      window.addEventListener('pageshow', onPageShow);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('pageshow', onPageShow);
        this.clearIntroTimers();
      });
    });
  }

  private startIntro(): void {
    this.clearIntroTimers();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.introPhase.set(3);
      this.introLive.set(true);
      this.introVisible.set(true);
      return;
    }

    // Snap to boot with transitions off (kills reverse tween from prerendered phase 3)
    this.introLive.set(false);
    this.introVisible.set(false);
    this.introPhase.set(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.introLive.set(true);
        this.introVisible.set(true);

        const fadeInMs = 200;
        const bootHoldMs = 900; // 700 + 200
        const dockAtMs = 2500; // 2300 + 200
        const dockMs = 1200;
        const subtitleAtMs = dockAtMs + dockMs + 150;

        this.introTimers = [
          window.setTimeout(() => this.introPhase.set(1), fadeInMs + bootHoldMs),
          window.setTimeout(() => this.dockCardLeft(dockMs), fadeInMs + dockAtMs),
          window.setTimeout(() => this.introPhase.set(3), fadeInMs + subtitleAtMs)
        ];
      });
    });
  }

  private clearIntroTimers(): void {
    for (const id of this.introTimers) {
      window.clearTimeout(id);
    }
    this.introTimers = [];
  }

  /** FLIP: slide name card left; role heading is already in place behind it. */
  private dockCardLeft(durationMs: number): void {
    const el = this.heroLeft().nativeElement;
    const firstLeft = el.getBoundingClientRect().left;

    this.introPhase.set(2);

    requestAnimationFrame(() => {
      const lastLeft = el.getBoundingClientRect().left;
      const dx = firstLeft - lastLeft;

      if (Math.abs(dx) < 1) {
        return;
      }

      el.animate(
        [{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }],
        {
          duration: durationMs,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          fill: 'none'
        }
      );
    });
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(meData.email);
      this.copyFeedback.set(this.copy().emailCopied);
    } catch {
      this.copyFeedback.set(this.copy().emailCopyFailed);
    }

    window.setTimeout(() => {
      this.copyFeedback.set('');
    }, 2500);
  }
}
