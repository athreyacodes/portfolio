import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';

import { SeoService } from './seo';

/** Applies metadata before the route activates, so prerendered HTML carries it. */
export const homeSeoResolver: ResolveFn<boolean> = () => {
  const seo = inject(SeoService);
  seo.apply('home', '/');
  seo.setStructuredData();
  return true;
};

export const notFoundSeoResolver: ResolveFn<boolean> = () => {
  inject(SeoService).apply('notFound', '/404');
  return true;
};
