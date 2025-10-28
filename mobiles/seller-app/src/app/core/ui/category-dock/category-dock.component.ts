import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Category } from '../../models/dtos';

@Component({
  standalone: true,
  selector: 'app-category-dock',
  imports: [CommonModule, IonicModule],
  templateUrl: './category-dock.component.html',
  styleUrls: ['./category-dock.component.scss']
})
export class CategoryDockComponent {
  @Input() categories: Category[] = [];
  @Input() selected: string | null = null;
  @Input() counts?: Record<string, number>;
  @Input() compact = false;
  @Input() sticky = false;     // ⬅️ par défaut: NON-sticky (ne cache rien)
  @Input() showCount = false;

  @Output() changed = new EventEmitter<string | null>();

  select(id: string | null) { this.changed.emit(id); }

  initial(name: string) {
    return (name?.trim()?.charAt(0) || 'C').toUpperCase();
  }

  avatarBg(i: number) {
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