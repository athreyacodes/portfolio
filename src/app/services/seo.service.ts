import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import seoData from '../data/seo.json';

export type SeoKey = keyof typeof seoData;

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
  private personSchemaScript: HTMLScriptElement | null = null;

  constructor(
    private titleService: Title,
    private metaService: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateSeo(key: SeoKey): void {
    const config = seoData[key];
    if (!config) {
      console.warn(`SEO configuration key "${key}" not found in seo.json`);
      return;
    }

    this.titleService.setTitle(config.title);
    this.metaService.updateTag({ name: 'description', content: config.description });

    this.metaService.updateTag({ property: 'og:title', content: config.ogTitle });
    this.metaService.updateTag({ property: 'og:description', content: config.ogDescription });
    this.metaService.updateTag({ property: 'og:image', content: config.ogImage });
    this.metaService.updateTag({ property: 'og:type', content: config.ogType });

    if ('ogUrl' in config && config.ogUrl) {
      this.metaService.updateTag({ property: 'og:url', content: config.ogUrl });
    }

    this.metaService.updateTag({ name: 'twitter:card', content: config.twitterCard });
    this.metaService.updateTag({ name: 'twitter:title', content: config.twitterTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: config.twitterDescription });
    this.metaService.updateTag({ name: 'twitter:image', content: config.twitterImage });

    if ('canonicalUrl' in config && config.canonicalUrl) {
      this.setCanonicalUrl(config.canonicalUrl);
    }
  }

  setPersonSchema(person: PersonSchema): void {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      jobTitle: person.jobTitle,
      email: person.email,
      image: this.toAbsoluteUrl(person.image),
      sameAs: person.sameAs
    };

    if (this.personSchemaScript) {
      this.personSchemaScript.textContent = JSON.stringify(schema);
      return;
    }

    this.personSchemaScript = this.document.createElement('script');
    this.personSchemaScript.type = 'application/ld+json';
    this.personSchemaScript.textContent = JSON.stringify(schema);
    this.document.head.appendChild(this.personSchemaScript);
  }

  private setCanonicalUrl(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private toAbsoluteUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }

    const config = seoData.home;
    const base = 'canonicalUrl' in config && config.canonicalUrl
      ? config.canonicalUrl.replace(/\/$/, '')
      : '';

    return `${base}/${path.replace(/^\//, '')}`;
  }
}
