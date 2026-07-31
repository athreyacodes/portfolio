import { Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { SeoService } from '../../services/seo.service';
import meData from '../../data/me.json';

@Component({
  selector: 'app-intro-banner',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './intro-banner.html',
  styleUrl: './intro-banner.scss'
})
export class IntroBanner implements OnInit {
  protected readonly me = meData;

  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    this.seoService.updateSeo('home');
  }
}
