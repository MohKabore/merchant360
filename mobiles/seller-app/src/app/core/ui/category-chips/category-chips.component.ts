import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models/dtos';

@Component({
  standalone:true, selector:'app-category-chips',
  imports:[CommonModule, IonicModule],
  template:`
  <div class="chips">
    <ion-chip [outline]="!selected" (click)="select(null)"><ion-label>Toutes</ion-label></ion-chip>
    <ion-chip *ngFor="let c of categories" [outline]="selected!==c.id" (click)="select(c.id)">
      <ion-label>{{ c.name }}</ion-label>
    </ion-chip>
  </div>`,
  styles:[`.chips{ display:flex; gap:8px; overflow:auto; padding:8px; background:#fff; border-bottom:1px solid #eee; }`]
})
export class CategoryChipsComponent{
  @Input() categories:Category[]=[]; @Input() selected:string|null=null;
  @Output() changed=new EventEmitter<string|null>();
  select(id:string|null){ this.changed.emit(id); }
}