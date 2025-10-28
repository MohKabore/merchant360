import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true, selector:'app-quick-sale', imports:[CommonModule, IonicModule],
  template:`<ion-header><ion-toolbar><ion-title>Vente express</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding"><div class="sub">À implémenter (panier + WhatsApp) ✨</div></ion-content>`
})
export class QuickSalePage{}