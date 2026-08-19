import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const VISIBLE_MS = 3200;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly message = signal<string | null>(null);

  show(message: string): void {
    if (!this.isBrowser) {
      return;
    }

    clearTimeout(this.timer);
    this.message.set(message);
    this.timer = setTimeout(() => this.message.set(null), VISIBLE_MS);
  }

  dismiss(): void {
    clearTimeout(this.timer);
    this.message.set(null);
  }
}
