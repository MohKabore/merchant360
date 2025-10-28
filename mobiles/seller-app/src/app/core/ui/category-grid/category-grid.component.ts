import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/dtos';

@Component({
  standalone: true,
  selector: 'app-category-grid',
  imports: [CommonModule, IonicModule],
  template: `
  <div class="grid">
    <button class="tile" *ngFor="let c of categories" (click)="changed.emit(c.id)">
      <div class="hero" [style.backgroundImage]="hero(c)"></div>
      <div class="info">
        <div class="n">{{ c.name }}</div>
        <div class="s">{{ subLabel }}</div>
      </div>
    </button>
  </div>
  `,
  styles: [`
  .grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; padding:12px; }
  .tile{
    appearance:none; border:0; background:#fff; border-radius:16px; overflow:hidden;
    box-shadow:var(--sh-sm); text-align:left; transition:transform .08s ease, box-shadow .2s ease;
  }
  .tile:active{ transform:translateY(1px);}
  .hero{ height:84px; background-size:cover; background-position:center; }
  .info{ padding:10px 12px; }
  .n{ font-weight:800; font-size:14px; color:var(--ink); }
  .s{ font-size:12px; color:var(--muted); margin-top:2px; }
  `]
})
export class CategoryGridComponent{
  @Input() categories: Category[] = [];
  @Input() subLabel = 'Voir les produits';
  @Output() changed = new EventEmitter<string>();

  hero(c:Category){
    // visuel léger via picsum seedé sur le nom
    const url = `https://picsum.photos/seed/${encodeURIComponent(c.slug || c.name)}/400/300`;
    return `url(${url})`;
  }
}