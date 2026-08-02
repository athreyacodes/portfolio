import { Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import meData from '../../data/me.json';

@Component({
  selector: 'app-home',
  imports: [NgOptimizedImage, MatTooltipModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  protected readonly me = meData;
  protected readonly copyFeedback = signal('');

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(meData.email);
      this.copyFeedback.set('Email copied to clipboard');
    } catch {
      this.copyFeedback.set('Could not copy email');
    }

    window.setTimeout(() => {
      this.copyFeedback.set('');
    }, 2500);
  }
}
