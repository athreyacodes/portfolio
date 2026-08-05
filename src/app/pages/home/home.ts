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
  styleUrl: './home.scss'
})
export class HomeComponent {
  private readonly languageService = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly heroLeft = viewChild.required<ElementRef<HTMLElement>>('heroLeft');

  protected readonly me = meData;
  protected readonly copy = this.languageService.copy;
  protected readonly copyFeedback = signal('');
  protected readonly introPhase = signal<HeroIntroPhase>(0);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        this.introPhase.set(3);
        return;
      }

      const bootHoldMs = 550;
      const dockAtMs = 2100;
      const dockMs = 1200;
      const subtitleAtMs = dockAtMs + dockMs + 150;

      const timers = [
        window.setTimeout(() => this.introPhase.set(1), bootHoldMs),
        window.setTimeout(() => this.dockCardLeft(dockMs), dockAtMs),
        window.setTimeout(() => this.introPhase.set(3), subtitleAtMs)
      ];

      this.destroyRef.onDestroy(() => {
        for (const id of timers) {
          window.clearTimeout(id);
        }
      });
    });
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
