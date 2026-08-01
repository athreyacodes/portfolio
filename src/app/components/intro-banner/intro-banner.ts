import { Component, OnInit, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SeoService } from '../../services/seo.service';
import { ScrollService } from '../../services/scroll.service';
import { ThemeService } from '../../services/theme.service';
import { DynamicImageHeightDirective } from '../../directives/dynamic-image-height.directive';
import { getExperienceYears } from '../../utils/experience';
import meData from '../../data/me.json';

@Component({
  selector: 'app-intro-banner',
  standalone: true,
  imports: [NgOptimizedImage, DynamicImageHeightDirective, MatTooltipModule],
  templateUrl: './intro-banner.html',
  styleUrl: './intro-banner.scss'
})
export class IntroBanner implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly scrollService = inject(ScrollService);
  private readonly themeService = inject(ThemeService);

  protected readonly me = meData;
  protected readonly experienceYears = getExperienceYears(meData.experienceStartYear);
  protected copyFeedback = '';

  ngOnInit(): void {
    this.seoService.updateSeo('home');
    this.seoService.setPersonSchema({
      name: meData.name,
      jobTitle: meData.title,
      email: meData.email,
      image: meData.photoPath,
      sameAs: [meData.linkedin, meData.github]
    });
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(meData.email);
      this.copyFeedback = 'Email copied to clipboard';
    } catch {
      this.copyFeedback = 'Could not copy email';
    }

    window.setTimeout(() => {
      this.copyFeedback = '';
    }, 2500);
  }

  protected scrollToSkills(): void {
    this.scrollService.scrollTo('skills');
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
