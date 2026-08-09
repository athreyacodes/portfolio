import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';

import { I18nService } from '../../core/i18n';
import { ScrollSpyService, SectionId } from '../../core/scroll-spy';
import { Icon, IconName } from '../../shared/icon/icon';
import { Menu } from '../menu/menu';

interface NavItem {
  readonly id: SectionId;
  readonly icon: IconName;
  readonly label: string;
}

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, Menu],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  private readonly i18n = inject(I18nService);
  private readonly scrollSpy = inject(ScrollSpyService);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly copy = this.i18n.copy;
  protected readonly active = this.scrollSpy.active;
  protected readonly menuOpen = signal(false);

  protected readonly navItems = computed<readonly NavItem[]>(() => {
    const labels = this.copy().header.navItems;
    return [
      { id: 'home', icon: 'home', label: labels.banner },
      { id: 'skills', icon: 'skills', label: labels.skills },
      { id: 'experience', icon: 'experience', label: labels.experience }
    ];
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Sections must exist in the DOM before the observer can attach to them.
    afterNextRender(() => destroyRef.onDestroy(this.scrollSpy.observe()));
  }

  protected openMenu(): void {
    this.menuOpen.set(true);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
    this.trigger().nativeElement.focus();
  }

  /**
   * The crumbs are real anchors so they deep-link and work without JS; the
   * handler only upgrades them to a smooth in-page scroll.
   */
  protected onNavClick(event: MouseEvent, id: SectionId): void {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }
    event.preventDefault();
    this.scrollSpy.scrollTo(id);
  }
}
