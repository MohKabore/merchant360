import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import {
  addOutline, homeOutline, pricetagsOutline, flashOutline, settingsOutline,
  cubeOutline, createOutline, trashOutline, searchOutline, funnelOutline
} from 'ionicons/icons';
import { slideYFade } from './app/animations';

addIcons({
  addOutline, homeOutline, pricetagsOutline, flashOutline, settingsOutline,
  cubeOutline, createOutline, trashOutline, searchOutline, funnelOutline,
});
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
provideIonicAngular(),
provideIonicAngular({ navAnimation: slideYFade }),
// provideIonicAngular(),
    provideAnimations(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
