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

import { I18nService, interpolate } from '../../../core/i18n';
import { ThemeMode, ThemeService } from '../../../core/theme';
import { Icon } from '../../../shared/icon/icon';
import { whileVisible } from '../../../core/visibility';

interface Logo {
  readonly src: string;
  readonly avif?: string;
  readonly webp?: string;
  readonly width: number;
  readonly height: number;
}

/** Raster logos are pre-scaled to 84px tall, which covers a 28px box at 3x. */
function raster(name: string, width: number): Logo {
  const base = `/images/logo/${name}`;
  return { src: `${base}.png`, avif: `${base}.avif`, webp: `${base}.webp`, width, height: 84 };
}

const LOGOS: Record<string, Logo | Record<ThemeMode, Logo>> = {
  mphasis: {
    light: raster('mphasis', 254),
    dark: raster('mphasis-white-text', 254)
  },
  enate: { src: '/images/logo/enate.svg', width: 97, height: 25 },
  mimecast: raster('mimecast-white', 518)
};

const ROLE_INTERVAL_MS = 3000;
const FLIP_MS = 320;

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './experience.html',
  styleUrl: './experience.scss'
})
export class Experience {
  private readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private roleTimer: ReturnType<typeof setInterval> | undefined;
  private flipTimer: ReturnType<typeof setTimeout> | undefined;

  protected readonly copy = this.i18n.copy;
  protected readonly roleIndex = signal(0);
  protected readonly flipping = signal(false);

  protected readonly companies = computed(() =>
    this.copy().exp.companies.map((company) => ({
      ...company,
      logo: this.logoFor(company.logoId),
      atCompany: interpolate(this.copy().exp.atCompany, { company: company.company })
    }))
  );

  protected readonly currentRole = computed(() => {
    const roles = this.copy().exp.future.roles;
    return roles[this.roleIndex() % roles.length];
  });

  constructor() {
    whileVisible(
      () => this.startRoleRotation(),
      () => this.stopRoleRotation()
    );
    inject(DestroyRef).onDestroy(() => this.stopRoleRotation());
  }

  private logoFor(logoId: string): Logo {
    const entry = LOGOS[logoId] ?? LOGOS['mphasis'];
    return 'src' in entry ? entry : entry[this.theme.theme()];
  }

  private startRoleRotation(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.isBrowser || this.roleTimer || reducedMotion) {
      return;
    }

    this.roleTimer = setInterval(() => {
      this.flipping.set(true);
      this.flipTimer = setTimeout(() => {
        this.roleIndex.update((i) => i + 1);
        this.flipping.set(false);
      }, FLIP_MS);
    }, ROLE_INTERVAL_MS);
  }

  private stopRoleRotation(): void {
    clearInterval(this.roleTimer);
    clearTimeout(this.flipTimer);
    this.roleTimer = undefined;
    this.flipping.set(false);
  }
}
