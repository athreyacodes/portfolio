import { Component, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import meData from '../../data/me.json';
import { LanguageService } from '../../services/language.service';
import { SkillsComponent } from './skills/skills';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, MatTooltipModule, SkillsComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  private readonly languageService = inject(LanguageService);

  protected readonly me = meData;
  protected readonly copy = this.languageService.copy;
  protected readonly copyFeedback = signal('');

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(meData.email);
      this.copyFeedback.set(this.copy().emailCopied);
    } catch {
      this.copyFeedback.set(this.copy().emailCopyFailed);
    }

    window.setTimeout(() => {
      this.copyFeedback.set('');
    }, 2500);
  }
}
