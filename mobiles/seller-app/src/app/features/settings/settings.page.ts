import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; import { CommonModule } from '@angular/common';
@Component({
  standalone:true, selector:'app-settings', imports:[CommonModule, IonicModule],
  template:`<ion-header><ion-toolbar><ion-title>Réglages</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding"><div class="sub">Theme presets & langue — bientôt</div></ion-content>`
})
export class SettingsPage{}