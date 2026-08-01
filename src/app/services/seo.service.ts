import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import seoData from '../data/seo.json';

export type SeoKey = Exclude<keyof typeof seoData, 'siteUrl'>;

export interface PersonSchema {
  name: string;
  jobTitle: string;
  email: string;
  image: string;
  sameAs: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private readonly siteUrl = seoData.siteUrl.replace(/\/$/, '');
  private personSchemaScript: HTMLScriptElement | null = null;

  updateSeo(key: SeoKey, replacements: Record<string, string | number> = {}): void {
    const config = seoData[key];
    if (!config) {
      console.warn(`SEO configuration key "${key}" not found in seo.json`);
      return;
    }

    const description = this.applyReplacements(config.description, replacements);
    const pageUrl = `${this.siteUrl}/`;
    const ogImage = this.toAbsoluteUrl(config.ogImage);
    const twitterImage = this.toAbsoluteUrl(config.twitterImage);

    this.titleService.setTitle(config.title);

    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ name: 'robots', content: config.robots });
    this.metaService.updateTag({ name: 'author', content: 'Athreya M R' });

    this.metaService.updateTag({ property: 'og:title', content: config.ogTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.ogDescription });
    this.metaService.updateTag({ property: 'og:image', content: ogImage });
    this.metaService.updateTag({ property: 'og:type', content: config.ogType });
    this.metaService.updateTag({ property: 'og:url', content: pageUrl });
    this.metaService.updateTag({ property: 'og:locale', content: 'en_US' });
    this.metaService.updateTag({ property: 'og:site_name', content: 'Athreya M R' });

    this.metaService.updateTag({ name: 'twitter:card', content: config.twitterCard });
    this.metaService.updateTag({ name: 'twitter:title', content: config.twitterTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.twitterDescription });
    this.metaService.updateTag({ name: 'twitter:image', content: twitterImage });
    this.metaService.updateTag({ name: 'twitter:image:alt', content: config.twitterImageAlt });

    this.setCanonicalUrl(pageUrl);
  }

  setPersonSchema(person: PersonSchema): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      jobTitle: person.jobTitle,
      url: `${this.siteUrl}/`,
      email: person.email,
      image: this.toAbsoluteUrl(person.image),
      sameAs: person.sameAs
    };

    const payload = JSON.stringify(schema);

    if (this.personSchemaScript) {
      this.personSchemaScript.textContent = payload;
      return;
    }

    const existing = this.document.head.querySelector(
      'script[type="application/ld+json"][data-seo="person"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.textContent = payload;
      this.personSchemaScript = existing;
      return;
    }

    this.personSchemaScript = this.document.createElement('script');
    this.personSchemaScript.type = 'application/ld+json';
    this.personSchemaScript.setAttribute('data-seo', 'person');
    this.personSchemaScript.textContent = payload;
    this.document.head.appendChild(this.personSchemaScript);
  }

  private applyReplacements(value: string, replacements: Record<string, string | number>): string {
    return Object.entries(replacements).reduce(
      (result, [token, replacement]) => result.replaceAll(`{${token}}`, String(replacement)),
      value
    );
  }

  private setCanonicalUrl(url: string): void {
    let link = this.document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private toAbsoluteUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    return `${this.siteUrl}/${path.replace(/^\//, '')}`;
  }
}
