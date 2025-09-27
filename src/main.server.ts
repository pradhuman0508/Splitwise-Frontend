import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering } from '@angular/platform-server';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

export default function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideServerRendering(),
      ...config.providers,
    ],
  });
}
