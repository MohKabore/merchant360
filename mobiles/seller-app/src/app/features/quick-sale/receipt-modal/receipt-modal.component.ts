import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  standalone: true,
  selector: 'app-receipt-modal',
  imports: [CommonModule, IonicModule],
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.scss']
})
export class ReceiptModalComponent {
  @Input() receipt!: {
    id: string;
    createdAt: string;
    merchant: { name: string; address: string; phone: string };
    paymentMethod: string;
    currency: string;
    lines: { name: string; qty: number; price: number; lineDiscount?: number }[];
    subTotal: number; discount: number; total: number; cash: number; change: number;
  };

  constructor(private modalCtrl: ModalController) {}

  close(){ this.modalCtrl.dismiss(); }

  print(){ window.print(); }
}