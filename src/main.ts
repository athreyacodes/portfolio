import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ENABLE_ANIMATIONS } from './app/constants/animations';

if (ENABLE_ANIMATIONS) {
  document.documentElement.classList.add('animations-on');
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
