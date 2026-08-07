import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import meData from '../../../data/me.json';
import { LanguageService } from '../../../services/language.service';
import { getExperienceYears } from '../../../utils/experience';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.html',
  styleUrl: './intro.scss'
})
export class IntroComponent {
  private readonly languageService = inject(LanguageService);
  private readonly years = getExperienceYears(meData.experienceStartYear);

  protected readonly me = meData;
  protected readonly copy = this.languageService.copy;
  protected readonly copyFeedback = signal('');
  protected readonly photoSizes =
    '(max-width: 900px) min(40vw, 200px), clamp(180px, 33vmin, 280px)';

  protected readonly subtitles = computed(() =>
    this.copy().homeSubtitles.map((line) =>
      line.replaceAll('{years}', String(this.years))
    )
  );

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(meData.email);
      this.copyFeedback.set(this.copy().emailCopied);
    } catch {
      this.copyFeedback.set(this.copy().emailCopyFailed);
    }

    window.setTimeout(() => this.copyFeedback.set(''), 2500);
  }
}
