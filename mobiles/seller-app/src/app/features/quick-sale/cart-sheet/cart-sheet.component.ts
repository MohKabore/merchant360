import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

type PaymentType = 'Total'|'Partial'|'Credit';
type PaymentMode  = 'Cash'|'Card'|'MobileMoney';
type MobileOperator = 'Wave'|'OrangeMoney'|'MoMo';
type DiscountType = 'amount'|'percent';

type CartLine = {
  id: string; name: string; price: number; currency: string;
  image?: string; qty: number; stock?: number;
  lineDiscount?: number; lineDiscountType?: DiscountType;
};

@Component({
  standalone: true,
  selector: 'app-cart-sheet',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './cart-sheet.component.html',
  styleUrls: ['./cart-sheet.component.scss']
})
export class CartSheetComponent implements OnChanges {
  @Input() cart: CartLine[] = [];
  @Input() subTotal = 0;       // reçu du parent (non utilisé pour l'affichage)
  @Input() discount = 0;       // remise globale montant (parent)
  @Input() total = 0;          // reçu du parent (non utilisé pour l'affichage)
  @Input() cash = 0;
  @Input() currency = 'XOF';
  @Input() paymentMethod: PaymentMode = 'Cash';

  // Paiement
  paymentType: PaymentType = 'Total';
  mobileOperator: MobileOperator = 'Wave';
  amountPaid = 0;
  amountDue = 0;

  // Remise globale (UI locale)
  globalDiscountType: DiscountType = 'amount';
  globalDiscountValue = 0;  // si percent => %

  // Sorties parent
  @Output() inc = new EventEmitter<CartLine>();
  @Output() dec = new EventEmitter<CartLine>();
  @Output() rm  = new EventEmitter<CartLine>();
  @Output() editPrice = new EventEmitter<CartLine>();
  @Output() editLineDiscount = new EventEmitter<CartLine>(); // si tu veux garder le prompt externe
  @Output() changePayment  = new EventEmitter<PaymentMode>();
  @Output() changeDiscount = new EventEmitter<number>();  // MONTANT effectif
  @Output() changeCash     = new EventEmitter<number>();
  @Output() pay            = new EventEmitter<any>();     // non utilisé ici (on ferme avec dismiss)
  @Output() clear          = new EventEmitter<void>();

  constructor(private modalCtrl: ModalController) {}

  // ===== CALCULS LOCAUX (instantanés) =====
  trackById = (_:number, l:CartLine)=> l.id;

  private lineNet(l: CartLine): number {
    const gross = l.price * l.qty;
    const ld = l.lineDiscount || 0;
    const d = (l.lineDiscountType === 'percent')
      ? Math.min(100, Math.max(0, ld)) * gross / 100
      : Math.min(gross, Math.max(0, ld));
    return Math.max(0, gross - d);
  }
  get localSubTotal(){ return this.cart.reduce((s,l)=> s + this.lineNet(l), 0); }
  effectiveGlobalDiscountAmount(){
    const val = Number(this.globalDiscountValue || 0);
    if (this.globalDiscountType === 'percent') {
      return Math.max(0, Math.min(this.localSubTotal, Math.round(this.localSubTotal * val / 100)));
    }
    return Math.max(0, Math.min(this.localSubTotal, Math.round(val)));
  }
  get localTotal(){ return Math.max(0, this.localSubTotal - this.effectiveGlobalDiscountAmount()); }

  ngOnChanges(changes: SimpleChanges){
    if (changes['discount'] && this.globalDiscountType === 'amount') {
      this.globalDiscountValue = this.discount || 0;
    }
    this.recomputePayments();
    this.emitGlobal();
  }

  close(){ this.modalCtrl.dismiss(); }

  // Quantités
  onInc(l: CartLine){ if (l.stock!=null && l.qty>=l.stock) return; l.qty++; this.inc.emit(l); this.recomputePayments(); }
  onDec(l: CartLine){ if (l.qty>1){ l.qty--; this.dec.emit(l);} else this.onRemove(l); this.recomputePayments(); }
  onRemove(l: CartLine){ this.rm.emit(l); this.recomputePayments(); }
  clearNow(){ this.clear.emit(); this.recomputePayments(); }

  // Remise ligne — inline (type + valeur)
  onLineDiscountTypeChange(l: CartLine, t: DiscountType){
    l.lineDiscountType = t;
    if (t==='percent') l.lineDiscount = Math.min(100, Math.max(0, l.lineDiscount||0));
    else l.lineDiscount = Math.max(0, Math.min(l.price*l.qty, l.lineDiscount||0));
    this.recomputePayments();
  }
  onLineDiscountValueChange(l: CartLine, v:any){
    const n = Number(v||0);
    if ((l.lineDiscountType||'amount')==='percent') l.lineDiscount = Math.min(100, Math.max(0, n));
    else l.lineDiscount = Math.max(0, Math.min(l.price*l.qty, n));
    this.recomputePayments();
  }

  // Remise globale
  onGlobalDiscountTypeChange(t: DiscountType){
    this.globalDiscountType = t;
    if (t==='amount') this.globalDiscountValue = this.discount || 0;
    this.recomputePayments(); this.emitGlobal();
  }
  onGlobalDiscountValueChange(v:any){
    this.globalDiscountValue = Math.max(0, Number(v||0));
    this.recomputePayments(); this.emitGlobal();
  }
  private emitGlobal(){ this.changeDiscount.emit(this.effectiveGlobalDiscountAmount()); }

  // Paiement
  onPaymentModeChange(mode: PaymentMode){ this.paymentMethod = mode; this.changePayment.emit(mode); }
  onAmountPaidChange(v:any){ this.amountPaid = Math.max(0, Number(v||0)); this.recomputePayments(); }
  onCashChange(v:any){ this.changeCash.emit(Number(v||0)); }

  recomputePayments(){
    const T = this.localTotal;
    if (this.paymentType==='Total'){ this.amountPaid=T; this.amountDue=0; }
    else if (this.paymentType==='Partial'){
      const paid = Math.min(Math.max(0, Number(this.amountPaid||0)), T);
      this.amountPaid=paid; this.amountDue=Math.max(0, T-paid);
    } else {
      this.amountPaid=0; this.amountDue=T;
    }
  }

  // Enregistrer → dismiss('pay')
  payNow(){
    const T = this.localTotal;
    if (this.paymentType==='Partial'){
      const paid = Number(this.amountPaid||0);
      if (!(paid>0 && paid<T)){ this.modalCtrl.dismiss({ reason:'invalid-partial' }, 'error'); return; }
    }
    if (this.paymentType==='Credit'){ this.amountPaid=0; this.amountDue=T; }

    this.modalCtrl.dismiss({
      paymentType: this.paymentType,
      paymentMode: this.paymentMethod,
      mobileOperator: this.paymentMethod==='MobileMoney' ? this.mobileOperator : undefined,
      amountPaid: this.paymentType==='Total' ? T :
                  this.paymentType==='Partial' ? Number(this.amountPaid||0) : 0,
      amountDue: this.paymentType==='Total' ? 0 :
                 this.paymentType==='Partial' ? Math.max(0, T - Number(this.amountPaid||0)) : T
    }, 'pay');
  }
}