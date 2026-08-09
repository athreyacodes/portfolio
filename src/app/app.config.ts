import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideClientHydration(withIncrementalHydration())
  ]
};
