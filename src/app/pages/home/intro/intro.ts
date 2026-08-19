import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { getExperienceYears } from '../../../core/experience';
import { I18nService, interpolate } from '../../../core/i18n';
import { CV_FILENAME, CV_URL } from '../../../core/links';
import { ScrollSpyService } from '../../../core/scroll-spy';
import { ToastService } from '../../../core/toast';
import { Icon } from '../../../shared/icon/icon';
import { ProfilePhoto } from '../../../shared/profile-photo/profile-photo';

@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ProfilePhoto],
  templateUrl: './intro.html',
  styleUrl: './intro.scss'
})
export class Intro {
  private readonly i18n = inject(I18nService);
  private readonly scrollSpy = inject(ScrollSpyService);
  private readonly toast = inject(ToastService);

  protected readonly copy = this.i18n.copy;
  protected readonly cvUrl = CV_URL;
  protected readonly cvFilename = CV_FILENAME;

  protected readonly subtitle = computed(() =>
    interpolate(this.copy().banner.subtitle, { years: getExperienceYears() })
  );

  protected goToSkills(): void {
    this.scrollSpy.scrollTo('skills');
  }

  protected async copyEmail(): Promise<void> {
    const text = this.copy();
    const email = text.contactInfo.email;

    try {
      await navigator.clipboard.writeText(email);
      this.toast.show(interpolate(text.global.copied, { email }));
    } catch {
      this.toast.show(interpolate(text.global.copyFailed, { email }));
    }
  }
}
