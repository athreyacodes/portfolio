import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '../../core/i18n';
import { Header } from '../../layout/header/header';
import { Experience } from './experience/experience';
import { Intro } from './intro/intro';
import { Skills } from './skills/skills';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Header, Intro, Skills, Experience],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly i18n = inject(I18nService);
  protected readonly copy = this.i18n.copy;
  protected readonly year = new Date().getFullYear();
}
