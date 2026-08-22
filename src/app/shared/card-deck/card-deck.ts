import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';

import { I18nService } from '../../core/i18n';

const MOBILE_MQ = '(max-width: 820px)';
const INTERACTIVE = 'button, a, input, textarea, select, label';
const START_SLOP_PX = 8;
const SWIPE_PX = 72;
const RESET_OUT_MS = 280;
const RESET_IN_MS = 480;
const STAGGER_MS = 55;
const NUDGE_DELAY_MS = 550;
const PEEK_PX = 6;
const MAX_VISIBLE_STACK = 3;

/**
 * Mobile-only Tinder-style stack. Desktop is untouched: the host keeps its
 * existing layout until the 820px query matches, then swipe is attached.
 */
@Directive({
  selector: '[appCardDeck]',
  host: {
    class: 'card-deck',
    '[class.is-active]': 'enabled()',
    '[class.is-dragging]': 'dragging()',
    '[class.is-resetting]': 'resetting()',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerUp($event)',
    '(lostpointercapture)': 'onPointerUp($event)',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)'
  }
})
export class CardDeck {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly i18n = inject(I18nService);

  /** Direct children to stack. Defaults to skill articles or experience stops. */
  readonly itemSelector = input(':scope > .card, :scope > .stop');
  readonly deckIndexChange = output<number>();

  protected readonly enabled = signal(false);
  protected readonly dragging = signal(false);
  protected readonly resetting = signal(false);

  private items: HTMLElement[] = [];
  private index = 0;
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private dx = 0;
  private axis: 'pending' | 'x' | 'y' = 'pending';
  private reducedMotion = false;
  private ghostClick: { x: number; y: number; until: number } | undefined;
  private hint: HTMLParagraphElement | undefined;
  private nudgePlayed = false;
  private nudgeTimer: ReturnType<typeof setTimeout> | undefined;
  private visibility: IntersectionObserver | undefined;
  private clickGuard: (() => void) | undefined;
  private scrollLock: (() => void) | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const label = this.i18n.copy().global.swipeHint;
      if (this.hint) {
        this.hint.textContent = label;
      }
    });

    afterNextRender(() => {
      const mq = window.matchMedia(MOBILE_MQ);
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => {
        this.reducedMotion = motion.matches;
        this.setEnabled(mq.matches);
      };

      sync();
      mq.addEventListener('change', sync);
      motion.addEventListener('change', sync);
      destroyRef.onDestroy(() => {
        mq.removeEventListener('change', sync);
        motion.removeEventListener('change', sync);
        this.releasePointer();
        this.clearDeckStyles();
      });
    });
  }

  protected onPointerDown(event: PointerEvent): void {
    if (!this.enabled() || this.resetting() || event.button !== 0) {
      return;
    }
    if ((event.target as Element | null)?.closest(INTERACTIVE)) {
      return;
    }

    this.cancelNudge();

    this.refreshItems();
    const front = this.items[this.index];
    if (!front?.contains(event.target as Node)) {
      return;
    }

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.dx = 0;
    this.axis = 'pending';
    this.host.nativeElement.setPointerCapture(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId || this.resetting()) {
      return;
    }

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    if (this.axis === 'pending') {
      if (Math.hypot(dx, dy) < START_SLOP_PX) {
        return;
      }
      this.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (this.axis === 'y') {
        this.releasePointer();
        return;
      }
      this.dragging.set(true);
    }

    if (this.axis !== 'x') {
      return;
    }

    event.preventDefault();
    this.dx = dx;
    this.paintDrag(dx);
  }

  protected onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) {
      return;
    }

    const dx = this.dx;
    const swiped = this.axis === 'x';
    this.releasePointer();

    if (!swiped) {
      return;
    }

    const width = this.items[this.index]?.getBoundingClientRect().width ?? 320;
    const threshold = Math.max(SWIPE_PX, width * 0.22);

    if (dx > threshold) {
      this.suppressGhostClick(event);
      void this.goNext();
      return;
    }
    if (dx < -threshold) {
      this.suppressGhostClick(event);
      this.goPrev();
      return;
    }

    this.snapFront();
  }

  protected onClick(event: MouseEvent): void {
    if (!this.isGhostClick(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.enabled() || this.resetting()) {
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      void this.goNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.goPrev();
    }
  }

  private setEnabled(on: boolean): void {
    if (!on) {
      this.enabled.set(false);
      this.releasePointer();
      this.clearDeckStyles();
      this.index = 0;
      return;
    }

    this.enabled.set(true);
    this.refreshItems();
    this.sizeHost();
    this.mountHint();
    this.watchVisibility();
    this.render();
  }

  /** Size the pile to the tallest card so every card shares one slot. */
  private sizeHost(): void {
    const host = this.host.nativeElement;
    const probe = host.ownerDocument.createElement('div');
    probe.style.cssText =
      'position:absolute;visibility:hidden;pointer-events:none;inset:auto;block-size:auto;inline-size:100%';
    host.append(probe);

    let tallest = 0;
    for (const el of this.items) {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.removeAttribute('style');
      clone.style.cssText =
        'position:relative;inset:auto;block-size:auto;inline-size:100%;transform:none';
      for (const node of clone.querySelectorAll<HTMLElement>('.card')) {
        node.style.blockSize = 'auto';
        node.style.height = 'auto';
      }
      probe.replaceChildren(clone);
      tallest = Math.max(tallest, clone.getBoundingClientRect().height);
    }

    probe.remove();

    if (tallest > 0) {
      const stackRoom = PEEK_PX * MAX_VISIBLE_STACK;
      host.style.setProperty('--deck-peek', `${PEEK_PX}px`);
      host.style.setProperty('--deck-stack-room', `${stackRoom}px`);
      host.style.minBlockSize = `${Math.ceil(tallest) + stackRoom}px`;
    }
  }

  private refreshItems(): void {
    this.items = Array.from(this.host.nativeElement.querySelectorAll(this.itemSelector()), (node) =>
      node as HTMLElement
    );
  }

  private async goNext(): Promise<void> {
    this.dismissHint();

    if (this.index >= this.items.length - 1) {
      await this.resetDeck();
      return;
    }

    this.index += 1;
    this.render();
    this.deckIndexChange.emit(this.index);
  }

  private goPrev(): void {
    if (this.index <= 0) {
      this.snapFront();
      return;
    }

    this.dismissHint();
    this.index -= 1;
    this.render();
    this.deckIndexChange.emit(this.index);
  }

  private async resetDeck(): Promise<void> {
    const unlock = this.lockScroll();
    this.resetting.set(true);
    this.paintDismissed(this.items[this.index]);

    if (!this.reducedMotion) {
      await wait(RESET_OUT_MS);
    }

    this.index = 0;
    this.render({ reset: true });
    this.deckIndexChange.emit(0);

    if (!this.reducedMotion) {
      await wait(RESET_IN_MS + STAGGER_MS * Math.max(0, this.items.length - 1));
    }

    this.resetting.set(false);
    this.render();
    unlock();
  }

  /**
   * Ignore only the leftover click from this swipe (same spot, next ~500ms).
   * A new tap on French / theme must still work immediately.
   */
  private suppressGhostClick(event: PointerEvent): void {
    this.clickGuard?.();
    this.ghostClick = {
      x: event.clientX,
      y: event.clientY,
      until: performance.now() + 500
    };

    const doc = this.host.nativeElement.ownerDocument;
    const block = (click: Event) => {
      if (!(click instanceof MouseEvent) || !this.isGhostClick(click)) {
        return;
      }
      click.preventDefault();
      click.stopPropagation();
      stop();
    };

    doc.addEventListener('click', block, true);
    const timer = window.setTimeout(() => stop(), 500);
    const stop = () => {
      clearTimeout(timer);
      doc.removeEventListener('click', block, true);
      this.ghostClick = undefined;
      if (this.clickGuard === stop) {
        this.clickGuard = undefined;
      }
    };
    this.clickGuard = stop;
  }

  private isGhostClick(event: MouseEvent): boolean {
    const ghost = this.ghostClick;
    if (!ghost || performance.now() > ghost.until) {
      this.ghostClick = undefined;
      return false;
    }
    return Math.hypot(event.clientX - ghost.x, event.clientY - ghost.y) < 28;
  }

  private lockScroll(): () => void {
    this.scrollLock?.();
    const y = window.scrollY;
    const pin = () => {
      if (window.scrollY !== y) {
        window.scrollTo(0, y);
      }
    };
    window.addEventListener('scroll', pin, { capture: true, passive: true });
    const stop = () => {
      window.removeEventListener('scroll', pin, true);
      pin();
      if (this.scrollLock === stop) {
        this.scrollLock = undefined;
      }
    };
    this.scrollLock = stop;
    return stop;
  }

  private snapFront(): void {
    const front = this.items[this.index];
    if (!front) {
      return;
    }
    front.style.removeProperty('--deck-x');
    front.style.removeProperty('--deck-rot');
    this.render();
  }

  private paintDrag(dx: number): void {
    const front = this.items[this.index];
    if (!front) {
      return;
    }

    const rot = Math.max(-16, Math.min(16, dx / 18));
    front.style.setProperty('--deck-x', `${dx}px`);
    front.style.setProperty('--deck-rot', `${rot}deg`);
    front.style.transition = 'none';

    const next = this.items[this.index + 1];
    if (next) {
      const progress = Math.min(1, Math.abs(dx) / 160);
      next.style.setProperty('--deck-depth', String(1 - progress * 0.65));
      next.style.transition = 'none';
    }
  }

  private paintDismissed(el: HTMLElement | undefined): void {
    if (!el) {
      return;
    }
    el.dataset['deckState'] = 'dismissed';
    el.style.removeProperty('--deck-x');
    el.style.removeProperty('--deck-rot');
    el.style.transition = this.reducedMotion
      ? 'none'
      : 'transform 280ms ease, opacity 280ms ease';
  }

  private render(options: { reset?: boolean } = {}): void {
    const reset = options.reset === true;

    this.items.forEach((el, i) => {
      const depth = i - this.index;
      const delay = reset ? `${i * STAGGER_MS}ms` : '0ms';
      const duration = reset ? `${RESET_IN_MS}ms` : '320ms';

      el.style.removeProperty('--deck-x');
      el.style.removeProperty('--deck-rot');
      el.style.transition = this.reducedMotion
        ? 'none'
        : `transform ${duration} ${delay} cubic-bezier(0.22, 1, 0.36, 1), opacity ${duration} ${delay} ease`;

      if (i < this.index) {
        el.dataset['deckState'] = 'dismissed';
        el.style.setProperty('--deck-depth', '0');
      } else if (depth === 0) {
        el.dataset['deckState'] = 'front';
        el.style.setProperty('--deck-depth', '0');
      } else {
        el.dataset['deckState'] = 'stacked';
        el.style.setProperty('--deck-depth', String(depth));
      }

      el.classList.toggle('is-front', i === this.index);
      if (i === this.index) {
        el.removeAttribute('aria-hidden');
      } else {
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  private clearDeckStyles(): void {
    for (const el of this.items) {
      delete el.dataset['deckState'];
      el.classList.remove('is-front');
      el.removeAttribute('aria-hidden');
      el.style.removeProperty('--deck-depth');
      el.style.removeProperty('--deck-x');
      el.style.removeProperty('--deck-rot');
      el.style.removeProperty('transition');
    }
    this.host.nativeElement.style.removeProperty('min-block-size');
    this.visibility?.disconnect();
    this.visibility = undefined;
    this.clickGuard?.();
    this.scrollLock?.();
    this.cancelNudge();
    this.hint?.remove();
    this.hint = undefined;
    this.items = [];
  }

  private mountHint(): void {
    if (this.hint) {
      return;
    }

    const hint = this.host.nativeElement.ownerDocument.createElement('p');
    hint.className = 'deck-hint';
    hint.textContent = this.i18n.copy().global.swipeHint;
    hint.setAttribute('aria-hidden', 'true');
    this.host.nativeElement.insertAdjacentElement('afterend', hint);
    this.hint = hint;
  }

  private dismissHint(): void {
    this.hint?.classList.add('is-faded');
  }

  private watchVisibility(): void {
    if (this.visibility || this.nudgePlayed || this.reducedMotion) {
      return;
    }

    this.visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.scheduleNudge();
        }
      },
      { threshold: 0.45 }
    );
    this.visibility.observe(this.host.nativeElement);
  }

  private scheduleNudge(): void {
    if (this.nudgePlayed || this.reducedMotion) {
      return;
    }

    clearTimeout(this.nudgeTimer);
    this.nudgeTimer = setTimeout(() => this.playNudge(), NUDGE_DELAY_MS);
  }

  private playNudge(): void {
    const front = this.items[this.index];
    if (!front || this.nudgePlayed || this.dragging() || this.resetting()) {
      return;
    }

    this.nudgePlayed = true;
    front.classList.add('is-nudging');
    const done = () => {
      front.classList.remove('is-nudging');
      front.removeEventListener('animationend', done);
    };
    front.addEventListener('animationend', done);
  }

  private cancelNudge(): void {
    clearTimeout(this.nudgeTimer);
    this.nudgeTimer = undefined;
    this.nudgePlayed = true;
    this.items[this.index]?.classList.remove('is-nudging');
  }

  private releasePointer(): void {
    if (this.pointerId !== null) {
      const node = this.host.nativeElement;
      if (node.hasPointerCapture(this.pointerId)) {
        node.releasePointerCapture(this.pointerId);
      }
    }
    this.pointerId = null;
    this.axis = 'pending';
    this.dx = 0;
    this.dragging.set(false);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
