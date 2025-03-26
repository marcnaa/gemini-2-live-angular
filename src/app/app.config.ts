import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { loggerFeature } from './logging/logger-reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore({
      logger: loggerFeature.reducer
    }),
    provideStoreDevtools({
      maxAge: 25, // Retains last 25 states
      logOnly: false, // Allows logging in production
    }),
  ]
};
