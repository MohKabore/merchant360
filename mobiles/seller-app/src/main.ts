import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import {
  addOutline, homeOutline, pricetagsOutline, flashOutline, settingsOutline,
  cubeOutline, createOutline, searchOutline, funnelOutline,
  imageOutline, trashOutline,removeOutline,
  chevronBackOutline, chevronForwardOutline,
  starOutline,
  cashOutline,
  ellipsisHorizontalOutline,
  printOutline,
  shareOutline,
  closeOutline, calendar, calendarOutline,
   timeOutline, downloadOutline, receiptOutline,

   peopleOutline,
   logoWhatsapp,
   callOutline
} from 'ionicons/icons';
import { slideYFade } from './app/animations';

import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { LOCALE_ID } from '@angular/core';

// 👇 Enregistre la locale "fr"
registerLocaleData(fr);

addIcons({
  addOutline, homeOutline, pricetagsOutline, flashOutline, settingsOutline,callOutline,
  cubeOutline, createOutline, trashOutline, searchOutline, funnelOutline,calendar, calendarOutline,
  imageOutline, removeOutline,cashOutline,ellipsisHorizontalOutline,logoWhatsapp,
  chevronBackOutline, chevronForwardOutline,printOutline,shareOutline,closeOutline,
  starOutline,timeOutline, downloadOutline, receiptOutline,peopleOutline
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
