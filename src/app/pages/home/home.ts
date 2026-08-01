import { Component, OnInit, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SeoService } from '../../services/seo.service';
import { ThemeService } from '../../services/theme.service';
import meData from '../../data/me.json';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgOptimizedImage, MatTooltipModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly themeService = inject(ThemeService);

  protected readonly me = meData;
  protected copyFeedback = '';

  ngOnInit(): void {
    this.seoService.updateSeo('home');
    this.seoService.setPersonSchema({
      name: meData.name,
      jobTitle: meData.homeTitle,
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

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
