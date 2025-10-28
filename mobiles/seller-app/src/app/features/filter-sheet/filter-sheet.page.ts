import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Option = { id: string; label: string };

@Component({
  standalone: true,
  selector: 'app-filter-sheet',
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>Filtres</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="dismiss()">Fermer</ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <ion-list class="card">
    <ion-item>
      <ion-label>Catégorie</ion-label>
      <ion-select [(ngModel)]="selectedId" interface="popover" placeholder="Toutes">
        <ion-select-option [value]="null">Toutes</ion-select-option>
        <ion-select-option *ngFor="let o of options" [value]="o.id">{{ o.label }}</ion-select-option>
      </ion-select>
    </ion-item>
  </ion-list>

  <ion-button expand="block" color="primary" (click)="apply()">Appliquer</ion-button>
</ion-content>
  `,
})
export class FilterSheetComponent {
  @Input() options: Option[] = [];
  @Input() selectedId: string | null = null;

  constructor(private modal: ModalController) {}

  dismiss() { this.modal.dismiss(); }
  apply()   { this.modal.dismiss({ categoryId: this.selectedId }); }
}