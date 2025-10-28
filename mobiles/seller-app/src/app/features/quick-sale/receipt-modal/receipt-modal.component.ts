import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';

type ReceiptLine = { name: string; qty: number; price: number; lineDiscount?: number; currency: string; };
type ReceiptData = {
  id: string;
  createdAt: string;
  merchant?: { name: string; address?: string; phone?: string; logoUrl?: string };
  paymentMethod: 'Cash'|'MobileMoney'|'Card';
  currency: string;
  lines: ReceiptLine[];
  subTotal: number;
  discount: number;
  total: number;
  cash?: number;
  change?: number;
};

@Component({
  standalone: true,
  selector: 'app-receipt-modal',
  imports: [CommonModule, IonicModule, DatePipe],
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.scss']
})
export class ReceiptModalComponent {
  @Input() receipt!: ReceiptData;

  constructor(
    private modal: ModalController,
    private toast: ToastController,
  ) {}

  close(){ this.modal.dismiss(); }

  async share(){
    const title = `Reçu #${this.receipt.id}`;
    const text = `Total: ${this.receipt.total.toLocaleString()} ${this.receipt.currency} • Paiement: ${this.receipt.paymentMethod}`;
    if (navigator.share) {
      await navigator.share({ title, text });
    } else {
      await navigator.clipboard.writeText(`${title}\n${text}`);
      (await this.toast.create({ message: 'Résumé copié dans le presse-papiers', duration: 1200 })).present();
    }
  }

  print(){
    const w = window.open('', '_blank', 'width=480,height=800');
    if(!w) return;
    const html = document.getElementById('receipt-area')?.innerHTML ?? '';
    w.document.open();
    w.document.write(`
      <html>
        <head>
          <title>Ticket de caisse</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial; margin: 0; padding: 12px; }
            .rcpt { max-width: 420px; margin: 0 auto; }
            .head { text-align:center; }
            .name { font-weight: 800; font-size: 18px; }
            .meta { font-size: 12px; opacity:.75; margin-top:4px; }
            .hr { border-top:1px dashed #ddd; margin: 10px 0; }
            table { width:100%; border-collapse: collapse; font-size: 14px; }
            th, td { text-align:left; padding: 6px 0; }
            td.num { text-align:right; }
            .total { font-weight:800; font-size:16px; }
            .footer { margin-top:10px; text-align:center; font-size:12px; opacity:.8; }
          </style>
        </head>
        <body onload="window.print(); setTimeout(()=>window.close(), 200);">
          <div class="rcpt">${html}</div>
        </body>
      </html>`);
    w.document.close();
  }
}