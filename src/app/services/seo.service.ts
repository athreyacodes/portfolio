import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import seoData from '../data/seo.json';

export type SeoKey = keyof typeof seoData;

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(private titleService: Title, private metaService: Meta) {}

  updateSeo(key: SeoKey): void {
    const config = seoData[key];
    if (!config) {
      console.warn(`SEO configuration key "${key}" not found in seo.json`);
      return;
    }

    // Update Title
    this.titleService.setTitle(config.title);

    // Update Description
    this.metaService.updateTag({ name: 'description', content: config.description });

    // OpenGraph Tags
    this.metaService.updateTag({ property: 'og:title', content: config.ogTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.ogDescription });
    this.metaService.updateTag({ property: 'og:image', content: config.ogImage });
    this.metaService.updateTag({ property: 'og:type', content: config.ogType });

    // Twitter Tags
    this.metaService.updateTag({ name: 'twitter:card', content: config.twitterCard });
    this.metaService.updateTag({ name: 'twitter:title', content: config.twitterTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.twitterDescription });
    this.metaService.updateTag({ name: 'twitter:image', content: config.twitterImage });
  }
}
