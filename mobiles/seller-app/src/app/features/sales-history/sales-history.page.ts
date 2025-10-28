import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, ToastController } from '@ionic/angular';
import { FakeDataService, Sale } from 'src/app/core/services/fake-data.service';
import { ReceiptModalComponent } from '../quick-sale/receipt-modal/receipt-modal.component';


@Component({
  standalone: true,
  selector: 'app-sales-history',
  imports: [CommonModule, IonicModule],
  templateUrl: './sales-history.page.html'
})
export class SalesHistoryPage implements OnInit {
  private sales = inject(FakeDataService);
  private modal = inject(ModalController);
  private alert = inject(AlertController);
  private toast = inject(ToastController);

  items: Sale[] = [];
  loading = true;

  async ngOnInit(){
    this.items = await this.sales.list();
    this.loading = false;
  }

  async openReceipt(s: Sale){
    const m = await this.modal.create({
      component: ReceiptModalComponent,
      componentProps: {
        receipt: {
          id: s.id, createdAt: s.createdAt,
          paymentMethod: s.paymentMethod,
          currency: s.currency,
          lines: s.lines,
          subTotal: s.subTotal,
          discount: s.discount,
          total: s.total,
          cash: s.cash, change: s.change,
          merchant: { name: 'Merchant360 Demo' }
        }
      }
    });
    await m.present();
  }

  async clearAll(){
    const a = await this.alert.create({
      header: 'Vider l’historique',
      message: 'Confirmer la suppression de toutes les ventes locales ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Vider', role: 'destructive', handler: async () => {
          await this.sales.clearAll();
          this.items = [];
          (await this.toast.create({ message: 'Historique vidé', duration: 1200 })).present();
        }}
      ]
    });
    await a.present();
  }
}