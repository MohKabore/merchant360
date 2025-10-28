import { Component, EventEmitter, Output, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone:true, selector:'app-search-toolbar',
  imports:[CommonModule, IonicModule, FormsModule],
  template:`
  <ion-toolbar class="st">
    <ion-searchbar [(ngModel)]="value" (ionInput)="valueChange.emit(value)" [placeholder]="placeholder" animated="true" show-clear-button="focus"></ion-searchbar>
  </ion-toolbar>`,
  styles:[`.st{ --background:#fff; border-bottom:1px solid #eee; } ion-searchbar{ --background:#f3f4f6; --border-radius:12px; padding:8px 10px; }`]
})
export class SearchToolbarComponent{
  @Input() placeholder='Rechercher…';
  @Input() value=''; @Output() valueChange = new EventEmitter<string>();
}