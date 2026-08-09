import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { ThemeService } from '../../core/theme';

/**
 * Renders one of a light/dark pair of SVG illustrations.
 *
 * Prerendered HTML cannot know the visitor's theme, so a plain `<img>` would
 * make dark-mode visitors fetch the light asset during parse and the dark one
 * again after hydration. The `<source media>` lets the preload scanner pick the
 * right file with no JavaScript; both attributes then track the resolved theme,
 * which only diverges from the system preference if the visitor overrides it.
 */
@Component({
  selector: 'app-illustration',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <picture>
      <source media="(prefers-color-scheme: dark)" [srcset]="resolved() ?? dark()" />
      <img
        [src]="resolved() ?? light()"
        [alt]="alt()"
        [width]="width()"
        [height]="height()"
        loading="lazy"
        decoding="async"
      />
    </picture>
  `,
  styles: `
    :host {
      display: block;
    }

    picture {
      display: contents;
    }

    img {
      inline-size: 100%;
      block-size: auto;
    }
  `
})
export class Illustration {
  private readonly theme = inject(ThemeService);

  readonly name = input.required<string>();
  readonly alt = input.required<string>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();

  protected readonly light = computed(() => src('light', this.name()));
  protected readonly dark = computed(() => src('dark', this.name()));

  /** Null while prerendering, where the media query has to make the choice. */
  protected readonly resolved = computed(() =>
    this.theme.isBrowser ? src(this.theme.theme(), this.name()) : null
  );
}

function src(theme: string, name: string): string {
  return `/images/illustrations/theme-${theme}/${name}.svg`;
}
