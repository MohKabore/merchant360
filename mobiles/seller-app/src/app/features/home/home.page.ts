import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';

@Component({
  standalone:true, selector:'app-home',
  imports:[CommonModule, IonicModule],
  template:`
<ion-header><ion-toolbar><ion-title>Merchant360 Seller</ion-title></ion-toolbar></ion-header>
<ion-content>
  <div style="padding:var(--sp-3);">
    <div class="title">Bonjour Mohamed 👋</div>
    <div class="sub">{{ today }}</div>

    <div style="display:grid; gap:var(--sp-3); grid-template-columns:1fr 1fr; margin-top:var(--sp-4);">
      <div class="kpi tap"><div class="sub">Ventes du jour</div><div class="v">58 250 XOF</div></div>
      <div class="kpi tap"><div class="sub">Ruptures</div><div class="v">3</div></div>
    </div>

    <div class="card" style="margin-top:var(--sp-4);">
      <div style="font-weight:700; margin-bottom:8px;">Actions rapides</div>
      <ion-button color="primary" expand="block" routerLink="/tabs/products">Gérer mes produits</ion-button>
      <ion-button fill="outline" expand="block" style="margin-top:8px;" routerLink="/tabs/quick-sale">Vente express</ion-button>
    </div>
  </div>
</ion-content>`,
})
export class HomePage{
  today = dayjs().format('dddd D MMMM YYYY')
}