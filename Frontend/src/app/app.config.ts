import { ApplicationConfig, provideBrowserGlobalErrorListeners,provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';  
import { authInterceptor } from './auth-interceptor';
import { routes } from './app.routes';
import { app_routes } from './routing';
import {provideHttpClient ,withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(app_routes),
    provideZoneChangeDetection(),
    provideBrowserGlobalErrorListeners(),
     { provide: LOCALE_ID, useValue: 'fr-FR' },
     provideCharts(withDefaultRegisterables()),

    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
