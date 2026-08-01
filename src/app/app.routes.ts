import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { homeSeoResolver } from './resolvers/home-seo.resolver';
import seoData from './data/seo.json';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: seoData.home.title,
    resolve: { seo: homeSeoResolver }
  },
  { path: '**', redirectTo: '' }
];
