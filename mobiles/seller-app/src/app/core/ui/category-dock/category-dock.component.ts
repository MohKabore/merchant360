import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/dtos';

@Component({
  standalone: true,
  selector: 'app-category-dock',
  imports: [CommonModule, IonicModule],
  template: `
  <div class="dock" [class.compact]="compact">
    <!-- Carte "Toutes" -->
    <button class="card" [class.active]="selected===null" (click)="select(null)">
      <div class="avatar" [style.background]="avatarBg(0)">★</div>
      <div class="name">Toutes</div>
    </button>

    <!-- Catégories -->
    <button *ngFor="let c of categories; let i = index"
            class="card"
            [class.active]="selected===c.id"
            (click)="select(c.id)">
      <div class="avatar" [style.background]="avatarBg(i+1)">
        {{ initial(c.name) }}
      </div>
      <div class="name" [title]="c.name">{{ c.name }}</div>
      <div *ngIf="showCount && counts?.[c.id] !== undefined" class="count">{{ counts![c.id] }}</div>
    </button>
  </div>
  `,
  styles: [`
  :host{ display:block; }
  .dock{
    position: sticky; top: calc(var(--ion-safe-area-top,0px));
    z-index: 1; background:#fff; border-bottom:1px solid #eee;
    display:flex; gap:12px; overflow-x:auto; -webkit-overflow-scrolling:touch;
    padding:10px 12px 12px;
  }
  .dock.compact{ gap:10px; padding:8px 10px 10px; }

  .card{
    appearance:none; border:0; background:#fff;
    display:grid; grid-template-rows:auto auto; align-items:center; justify-items:center;
    row-gap:6px; padding:10px 12px; border-radius:16px; box-shadow:var(--sh-sm);
    min-width:92px; max-width:128px;
    transition:transform .08s ease, box-shadow .2s ease;
    position:relative;
  }
  .card:active{ transform:translateY(1px); }
  .card.active{ outline:2px solid color-mix(in oklab, var(--pri) 55%, transparent); }

  .avatar{
    width:44px; height:44px; border-radius:12px; color:#fff; font-weight:800; font-size:18px;
    display:grid; place-items:center; box-shadow:0 4px 10px rgba(0,0,0,.08);
  }
  .name{
    font-size:12.5px; font-weight:700; color:var(--ink);
    white-space:nowrap; text-overflow:ellipsis; overflow:hidden; max-width:100%;
  }
  .count{
    position:absolute; top:6px; right:6px; background:#111; color:#fff; font-size:11px; font-weight:700;
    padding:2px 6px; border-radius:999px; opacity:.85;
  }

  /* belles couleurs en dégradé pour les avatars */
  `]
})
export class CategoryDockComponent {
  @Input() categories: Category[] = [];
  @Input() selected: string | null = null;
  @Input() counts?: Record<string, number>;
  @Input() compact = false;
  @Input() showCount = false;

  @Output() changed = new EventEmitter<string | null>();

  select(id: string | null){ this.changed.emit(id); }
  initial(name:string){ return (name?.trim()?.charAt(0) || 'C').toUpperCase(); }

  avatarBg(i:number){
    // palette de dégradés douce (tu peux en ajouter)
    const G = [
      'linear-gradient(135deg,#8E0E1B,#C33B4C)',
      'linear-gradient(135deg,#1B998B,#34D1B6)',
      'linear-gradient(135deg,#6C5CE7,#A29BFE)',
      'linear-gradient(135deg,#F59E0B,#FBBF24)',
      'linear-gradient(135deg,#10B981,#34D399)',
      'linear-gradient(135deg,#3B82F6,#60A5FA)',
      'linear-gradient(135deg,#EC4899,#F472B6)',
      'linear-gradient(135deg,#F43F5E,#FB7185)',
    ];
    return G[i % G.length];
  }
}