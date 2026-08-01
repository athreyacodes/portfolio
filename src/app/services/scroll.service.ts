import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ScrollTarget = 'skills' | 'experience';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private readonly scrollTarget$ = new Subject<ScrollTarget>();

  readonly onScrollTo = this.scrollTarget$.asObservable();

  scrollTo(target: ScrollTarget): void {
    const elementId = target === 'skills' ? 'skills' : 'experience';
    const element = document.getElementById(elementId);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    this.scrollTarget$.next(target);
  }
}
