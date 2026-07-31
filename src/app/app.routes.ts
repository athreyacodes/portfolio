import { Routes } from '@angular/router';
import { IntroBanner } from './components/intro-banner/intro-banner';

export const routes: Routes = [
  { path: '', component: IntroBanner },
  { path: '**', redirectTo: '' }
];
