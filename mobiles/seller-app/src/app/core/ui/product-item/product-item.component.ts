import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/dtos';

@Component({
  standalone:true, selector:'app-product-item',
  imports:[CommonModule, IonicModule],
  template:`
  <ion-item button detail="false" class="pi">
    <ion-thumbnail slot="start" class="thumb"><img [src]="p?.images?.[0]?.url || fallback"/></ion-thumbnail>
    <ion-label>
      <div class="name">{{ p?.name }}</div>
      <div class="meta">{{ p?.price | currency:'XOF':'symbol':'1.0-0' }} • Stock: {{ p?.stockOnHand }}</div>
    </ion-label>
    <ion-badge [color]="(p?.stockOnHand ?? 0) > 0 ? 'success' : 'medium'">{{ (p?.stockOnHand ?? 0) > 0 ? 'Actif' : 'HS' }}</ion-badge>
  </ion-item>`,
  styles:[`
  .pi{ --background:#fff; border-radius:14px; margin:8px 6px; box-shadow:var(--sh-sm); }
  .thumb{ width:64px; height:64px; border-radius:12px; overflow:hidden; }
  .thumb img{ width:100%; height:100%; object-fit:cover; }
  .name{ font-weight:700; font-size:16px; } .meta{ color:var(--muted); font-size:13px; margin-top:2px; }
  `]
})
export class ProductItemComponent{
  @Input() p!:Product;
  fallback='https://picsum.photos/seed/placeholder/400';
}