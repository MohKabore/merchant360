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
   callOutline,
   mailOutline,
   cardOutline,
   documentTextOutline
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
  imageOutline, removeOutline,ellipsisHorizontalOutline,logoWhatsapp,
  chevronBackOutline, chevronForwardOutline,printOutline,shareOutline,closeOutline,
  starOutline,timeOutline, downloadOutline, receiptOutline,peopleOutline,
  'call-outline': callOutline,
  'logo-whatsapp': logoWhatsapp,
  'mail-outline': mailOutline,
  'cash-outline': cashOutline,
  'card-outline': cardOutline,
  'document-text-outline': documentTextOutline,
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
