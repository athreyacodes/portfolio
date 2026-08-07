import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from '../../../common/services/common.service';
import { Theme } from '../../../common/objects/enums';

const FUTURE_ROLE_KEYS = [
  'exp.future.roles.0',
  'exp.future.roles.1',
  'exp.future.roles.2',
] as const;

const FUTURE_INTERVAL_MS = 3000;
const FUTURE_FLIP_MS = 320;
const MPHASIS_LOGO = 'assets/images/logo/mphasis.png';
const MPHASIS_LOGO_DARK = 'assets/images/logo/mphasis-white-text.png';

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: false,
})
export class ExperienceComponent implements OnInit, OnDestroy {
  futureRoleKeys = FUTURE_ROLE_KEYS;
  futureRoleIndex = 0;
  isFutureFlipping = false;

  private futureTimer: ReturnType<typeof setInterval> | undefined;
  private flipTimer: ReturnType<typeof setTimeout> | undefined;

  get basePath() {
    return window.location.pathname;
  }

  get isDarkTheme() {
    return this.CommonSrv.SelectedTheme === Theme.Dark;
  }

  get currentFutureRoleKey(): string {
    return this.futureRoleKeys[this.futureRoleIndex];
  }

  constructor(private CommonSrv: CommonService) {}

  ngOnInit() {
    this.futureTimer = setInterval(() => this.advanceFutureRole(), FUTURE_INTERVAL_MS);
  }

  ngOnDestroy() {
    if (this.futureTimer) {
      clearInterval(this.futureTimer);
    }
    if (this.flipTimer) {
      clearTimeout(this.flipTimer);
    }
  }

  companyLogoSrc(data: { logo?: string }): string {
    const logo = data?.logo || '';
    if (logo.includes('mphasis') && this.isDarkTheme) {
      return this.basePath + MPHASIS_LOGO_DARK;
    }
    return this.basePath + (logo || MPHASIS_LOGO);
  }

  private advanceFutureRole() {
    this.isFutureFlipping = true;
    this.flipTimer = setTimeout(() => {
      this.futureRoleIndex = (this.futureRoleIndex + 1) % this.futureRoleKeys.length;
      this.isFutureFlipping = false;
    }, FUTURE_FLIP_MS);
  }
}
