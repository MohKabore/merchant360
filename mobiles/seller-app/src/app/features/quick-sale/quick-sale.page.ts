import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  AlertController,
  ActionSheetController,
  AnimationController,
  ModalController
} from '@ionic/angular';

import { FakeDataService, Sale } from 'src/app/core/services/fake-data.service';
import { Product } from 'src/app/core/models/dtos';
import { CartSheetComponent } from './cart-sheet/cart-sheet.component';
import { ReceiptModalComponent } from './receipt-modal/receipt-modal.component';
type CartLine = {
  id: string; name: string; price: number; currency: string;
  image?: string; qty: number; stock?: number; lineDiscount?: number;
};

@Component({
  standalone: true,
  selector: 'app-quick-sale',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './quick-sale.page.html',
  styleUrls: ['./quick-sale.page.scss']
})
export class QuickSalePage implements OnInit {
  // services
  private data = inject(FakeDataService);
  private toast = inject(ToastController);
  private alert = inject(AlertController);
  private sheet = inject(ActionSheetController);
  private animationCtrl = inject(AnimationController);
  private modal = inject(ModalController);
  private sales = inject(FakeDataService);

  // recherche
  q = '';
  suggestions: Product[] = [];
  loading = false;

  // panier
  cart: CartLine[] = [];
  discount = 0;
  cash = 0;
  currency: string = 'XOF';
  paymentMethod: 'Cash' | 'Card' | 'MobileMoney' = 'Cash';

  // UI
  placeholderImg = 'https://picsum.photos/seed/placeholder/200/200';
  addedFlash = false;

  async ngOnInit() { await this.refreshSuggestions(''); }

  // --- Recherche ---
  async onSearchChange() { await this.refreshSuggestions(this.q); }
  private async refreshSuggestions(search: string) {
    this.loading = true;
    this.suggestions = await this.data.listProducts({ search, take: 20 });
    this.loading = false;
  }

  // --- Panier ---
  get cartCount() { return this.cart.reduce((n, l) => n + l.qty, 0); }

  addToCart(p: Product) {
    const line = this.cart.find(x => x.id === p.id);
    if (line) this.incQty(line);
    else {
      this.cart.unshift({
        id: p.id, name: p.name, price: p.price,
        currency: p.currency ?? 'XOF',
        image: p.images?.[0]?.url, qty: 1, stock: p.stockOnHand
      });
      this.currency = p.currency || 'XOF';
    }
    this.flashPlusOne(); this.bumpCartBadge();
  }

  incQty(l: CartLine) { if (l.stock != null && l.qty >= l.stock) return; l.qty++; }
  decQty(l: CartLine) { if (l.qty > 1) l.qty--; else this.removeLine(l); }

  async removeLine(l: CartLine) {
    const a = await this.alert.create({
      header: 'Retirer',
      message: `Retirer <b>${l.name}</b> du panier ?`,
      buttons: [{ text: 'Non', role: 'cancel' },
      { text: 'Oui', role: 'destructive', handler: () => this.cart = this.cart.filter(x => x.id !== l.id) }]
    });
    await a.present();
  }
  clearCart() { this.cart = []; this.discount = 0; this.cash = 0; }

  // --- Éditions rapides (toujours dispo) ---
  // async promptQty(l: CartLine){
  //   const a = await this.alert.create({
  //     header: 'Quantité',
  //     inputs: [{ type:'number', name:'qty', value:l.qty, min:1 }],
  //     buttons: [{ text:'Annuler', role:'cancel' },
  //       { text:'OK', handler: ({qty})=>{
  //         const q = Math.max(1, Number(qyOr(qty, l.qty)));
  //         if (l.stock!=null && q>l.stock) return;
  //         l.qty = q;
  //       }}]
  //   }); await a.present();
  // }
  // async promptPrice(l: CartLine){
  //   const a = await this.alert.create({
  //     header:'Prix unitaire',
  //     inputs:[{ type:'number', name:'price', value:l.price, min:0 }],
  //     buttons:[{ text:'Annuler', role:'cancel' },
  //       { text:'OK', handler: ({price})=> l.price=Math.max(0, Number(qyOr(price,l.price))) }]
  //   }); await a.present();
  // }

  // async promptLineDiscount(l: CartLine){
  //   const a = await this.alert.create({
  //     header:'Remise (montant)',
  //     inputs:[{ type:'number', name:'disc', value:l.lineDiscount??0, min:0 }],
  //     buttons:[{ text:'Annuler', role:'cancel' },
  //       { text:'OK', handler: ({disc})=> l.lineDiscount=Math.max(0, Number(qyOr(disc,l.lineDiscount||0))) }]
  //   }); await a.present();
  // }
  async promptQty(l: CartLine) {
    const a = await this.alert.create({
      header: 'Quantité',
      inputs: [{ type: 'number', name: 'qty', value: l.qty, min: 1 }],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'OK', handler: ({ qty }) => {
            const n = Number(qty);
            const q = Math.max(1, Number.isFinite(n) ? n : l.qty);
            if (l.stock != null && q > l.stock) return; // on ne modifie pas si dépasse le stock
            l.qty = q; // ✅ pas de return
          }
        }
      ]
    });
    await a.present();
  }

  async promptPrice(l: CartLine) {
    const a = await this.alert.create({
      header: 'Prix unitaire',
      inputs: [{ type: 'number', name: 'price', value: l.price, min: 0 }],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'OK', handler: ({ price }) => {
            const n = Number(price);
            l.price = Math.max(0, Number.isFinite(n) ? n : l.price); // ✅ pas de return
          }
        }
      ]
    });
    await a.present();
  }
  async promptLineDiscount(l: CartLine) {
    const a = await this.alert.create({
      header: 'Remise (montant)',
      inputs: [{ type: 'number', name: 'disc', value: l.lineDiscount ?? 0, min: 0 }],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'OK', handler: ({ disc }) => {
            const n = Number(disc);
            l.lineDiscount = Math.max(0, Number.isFinite(n) ? n : (l.lineDiscount || 0)); // ✅ pas de return
          }
        }
      ]
    });
    await a.present();
  }

  // --- Totaux ---
  get subTotal() {
    return this.cart.reduce((s, l) => s + Math.max(0, l.price * l.qty - (l.lineDiscount || 0)), 0);
  }
  get total() { return Math.max(0, this.subTotal - (this.discount || 0)); }
  get change() { return Math.max(0, (this.cash || 0) - this.total); }
  get canPay() { return this.cart.length > 0 && this.total >= 0; }

  private bumpCartBadge() {
    const el = document.getElementById('cartBadge'); if (!el) return;
    this.animationCtrl.create().addElement(el).duration(220).iterations(1).keyframes([
      { offset: 0, transform: 'scale(1)' }, { offset: .6, transform: 'scale(1.22)' }, { offset: 1, transform: 'scale(1)' }
    ]).play();
  }
  private flashPlusOne() { this.addedFlash = true; setTimeout(() => this.addedFlash = false, 450); }

  async openCartSheet() {
    const m = await this.modal.create({
      component: CartSheetComponent,
      componentProps: {
        cart: this.cart,
        subTotal: this.subTotal,
        discount: this.discount,
        total: this.total,
        cash: this.cash,
        currency: this.currency,
        paymentMethod: this.paymentMethod
      },
      canDismiss: true,
      breakpoints: [0.2, 0.6, 0.95],
      initialBreakpoint: 0.6,
      showBackdrop: true
    });

    // ⬅️ on écoute directement sur l'élément modal (m)
    m.addEventListener('inc', (e: any) => this.incQty(e.detail));
    m.addEventListener('dec', (e: any) => this.decQty(e.detail));
    m.addEventListener('rm', (e: any) => this.removeLine(e.detail));
    m.addEventListener('editPrice', (e: any) => this.promptPrice(e.detail));
    m.addEventListener('editLineDiscount', (e: any) => this.promptLineDiscount(e.detail));
    m.addEventListener('changePayment', (e: any) => this.paymentMethod = e.detail);
    m.addEventListener('changeDiscount', (e: any) => this.discount = Number(e.detail || 0));
    m.addEventListener('changeCash', (e: any) => this.cash = Number(e.detail || 0));
    m.addEventListener('pay', async (e: any) => { await this.checkout(e.detail); m.dismiss(); });
    m.addEventListener('clear', () => this.clearCart());

    await m.present();
  }

  // --- Encaissement + Ticket + Historique ---
  async checkout(info: {
    paymentType: 'Total' | 'Partial' | 'Credit';
    paymentMode: 'Cash' | 'Card' | 'MobileMoney';
    mobileOperator?: 'Wave' | 'OrangeMoney' | 'MoMo';
    amountPaid?: number; amountDue?: number;
  }) {
    if (!this.canPay) return;

    const now = new Date().toISOString();
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();

    const paid = info.paymentType === 'Total' ? this.total :
      info.paymentType === 'Partial' ? (info.amountPaid || 0) : 0;

    const sale: Sale = {
      id, createdAt: now,
      lines: this.cart.map(l => ({ name: l.name, qty: l.qty, price: l.price, lineDiscount: l.lineDiscount, currency: l.currency })),
      subTotal: this.subTotal, discount: this.discount || 0, total: this.total, currency: this.currency,
      paymentMethod: info.paymentMode,
      cash: paid,
      change: Math.max(0, paid - this.total)
    };
    await this.sales.add(sale);

    const receipt = {
      id, createdAt: now,
      merchant: { name: 'Merchant360 Demo', address: 'Abidjan – Côte d’Ivoire', phone: '+225 xx xx xx xx' },
      paymentMethod: info.paymentMode + (info.paymentMode === 'MobileMoney' && info.mobileOperator ? ` • ${info.mobileOperator}` : ''),
      currency: this.currency, lines: sale.lines,
      subTotal: sale.subTotal, discount: sale.discount, total: sale.total,
      cash: sale.cash, change: sale.change
    } as const;

    const m2 = await this.modal.create({
      component: ReceiptModalComponent,
      componentProps: { receipt }, breakpoints: [0, .5, .9], initialBreakpoint: .9, showBackdrop: true
    });
    await m2.present();

    this.clearCart(); this.q = ''; await this.refreshSuggestions('');
  }
}

function qyOr(input: any, fallback: number) { const n = Number(input); return Number.isFinite(n) ? n : fallback; }