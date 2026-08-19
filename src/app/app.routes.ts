import { Routes } from '@angular/router';

import seoData from './data/seo.json';
import { homeSeoResolver, notFoundSeoResolver } from './core/seo.resolver';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    title: seoData.home.title,
    resolve: { seo: homeSeoResolver }
  },
  {
    path: '404',
    title: seoData.notFound.title,
    resolve: { seo: notFoundSeoResolver },
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
