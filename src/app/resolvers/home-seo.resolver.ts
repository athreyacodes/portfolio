import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SeoService } from '../services/seo.service';
import { getExperienceYears } from '../utils/experience';
import meData from '../data/me.json';

/** Applies home metadata + Person JSON-LD before the route activates (SSR-safe). */
export const homeSeoResolver: ResolveFn<boolean> = () => {
  const seo = inject(SeoService);
  const years = getExperienceYears(meData.experienceStartYear);

  seo.updateSeo('home', { years });
  seo.setPersonSchema({
    name: meData.name,
    jobTitle: meData.homeTitle,
    email: meData.email,
    image: meData.photoPath,
    sameAs: [meData.linkedin, meData.github]
  });

  return true;
};
