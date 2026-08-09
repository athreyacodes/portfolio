import { DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Drives a host element's animation timers from its on-screen state so nothing
 * ticks behind the fold. Must be called from an injection context.
 */
export function whileVisible(enter: () => void, leave: () => void): void {
  const host = inject(ElementRef<HTMLElement>);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? enter() : leave()),
      { threshold: 0 }
    );

    observer.observe(host.nativeElement);
    destroyRef.onDestroy(() => observer.disconnect());
  });
}
