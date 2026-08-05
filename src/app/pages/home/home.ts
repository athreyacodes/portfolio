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

/** 0 = centered name card, 1 = dock left + role, 2 = subtitle */
export type HeroIntroPhase = 0 | 1 | 2;

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, MatTooltipModule, SkillsComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  // SSR/prerender ships the final hero (phase 2). Client rebuilds and plays the intro.
  host: {
    ngSkipHydration: 'true',
    '[class.home--visible]': 'pageVisible()',
    '[class.home--cold]': '!introLive()'
  }
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
   * When false, intro transitions are disabled so the SSR final state can
   * snap to boot without animating backwards on refresh.
   */
  protected readonly introLive = signal(!isPlatformBrowser(this.platformId));
  /** Whole-page fade after cold boot snap (covers hero + skills). */
  protected readonly pageVisible = signal(!isPlatformBrowser(this.platformId));
  /** Skills stay hidden until after the role subtitle. */
  protected readonly skillsVisible = signal(false);
  /** Server/prerender: fully visible for SEO. Browser: boot at 0 and dock. */
  protected readonly introPhase = signal<HeroIntroPhase>(
    isPlatformBrowser(this.platformId) ? 0 : 2
  );

  private introTimers: number[] = [];

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      this.startIntro();

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
      this.introPhase.set(2);
      this.introLive.set(true);
      this.pageVisible.set(true);
      this.skillsVisible.set(true);
      return;
    }

    // Hide page, snap to centered name card (no reverse tween / flicker)
    this.introLive.set(false);
    this.pageVisible.set(false);
    this.skillsVisible.set(false);
    this.introPhase.set(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.introLive.set(true);
        this.pageVisible.set(true);

        const fadeInMs = 200;
        const bootHoldMs = 900;
        const dockMs = 1200;
        const subtitleAtMs = bootHoldMs + dockMs + 150;
        const skillsAtMs = subtitleAtMs + 450;

        this.introTimers = [
          window.setTimeout(() => this.dockCardLeft(dockMs), fadeInMs + bootHoldMs),
          window.setTimeout(() => this.introPhase.set(2), fadeInMs + subtitleAtMs),
          window.setTimeout(() => this.skillsVisible.set(true), fadeInMs + skillsAtMs)
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

  /** FLIP: slide name card left to reveal role. */
  private dockCardLeft(durationMs: number): void {
    const el = this.heroLeft().nativeElement;
    const firstLeft = el.getBoundingClientRect().left;

    this.introPhase.set(1);

    requestAnimationFrame(() => {
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
