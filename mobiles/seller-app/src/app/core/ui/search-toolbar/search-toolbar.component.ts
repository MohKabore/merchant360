import { Component, EventEmitter, Output, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-search-toolbar',
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <div class="st">
      <ion-searchbar
        [(ngModel)]="value"
        (ionInput)="valueChange.emit(value)"
        [placeholder]="placeholder"
        animated="true"
        show-clear-button="focus">
      </ion-searchbar>
    </div>
  `,
  styles: [`
    .st {
      position: sticky;
      top: var(--ion-safe-area-top);
      z-index: 1; /* petit, n’écrase rien */
      background: #fff;
      border-bottom: 1px solid #eee;
      padding: 6px 8px 10px;
    }
    ion-searchbar { --background:#f3f4f6; --border-radius:12px; }
  `]
})
export class SearchToolbarComponent {
  @Input() placeholder = 'Rechercher…';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}