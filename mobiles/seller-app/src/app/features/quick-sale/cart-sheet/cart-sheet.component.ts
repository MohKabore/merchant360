import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

type PaymentType = 'Total'|'Partial'|'Credit';
type PaymentMode  = 'Cash'|'Card'|'MobileMoney';
type MobileOperator = 'Wave'|'OrangeMoney'|'MoMo';

type CartLine = {
  id: string; name: string; price: number; currency: string;
  image?: string; qty: number; stock?: number; lineDiscount?: number;
};

@Component({
  standalone: true,
  selector: 'app-cart-sheet',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './cart-sheet.component.html'
})
export class CartSheetComponent implements OnChanges {
  @Input() cart: CartLine[] = [];
  @Input() subTotal = 0;
  @Input() discount = 0;
  @Input() total = 0;
  @Input() cash = 0;
  @Input() currency = 'XOF';
  @Input() paymentMethod: PaymentMode = 'Cash';

  paymentType: PaymentType = 'Total';
  mobileOperator: MobileOperator = 'Wave';
  amountPaid = 0;
  amountDue = 0;

  @Output() inc = new EventEmitter<CartLine>();
  @Output() dec = new EventEmitter<CartLine>();
  @Output() rm = new EventEmitter<CartLine>();
  @Output() editPrice = new EventEmitter<CartLine>();
  @Output() editLineDiscount = new EventEmitter<CartLine>();

  @Output() changePayment = new EventEmitter<PaymentMode>();
  @Output() changeDiscount = new EventEmitter<number>();
  @Output() changeCash = new EventEmitter<number>();
  @Output() pay = new EventEmitter<{
    paymentType: PaymentType;
    paymentMode: PaymentMode;
    mobileOperator?: MobileOperator;
    amountPaid?: number;
    amountDue?: number;
  }>();
  @Output() clear = new EventEmitter<void>();

  constructor(private modalCtrl: ModalController) {}

  ngOnChanges(changes: SimpleChanges){
    if (changes['total'] || changes['paymentType'] || changes['amountPaid']) {
      this.recompute();
    }
  }

  close(){ this.modalCtrl.dismiss(); }

  // ---- logique de calcul centralisée ----
  recompute(){
    if (this.paymentType === 'Total') {
      this.amountPaid = this.total;
      this.amountDue = 0;
    } else if (this.paymentType === 'Partial') {
      const paid = Math.min(Math.max(0, Number(this.amountPaid||0)), this.total);
      this.amountPaid = paid;
      this.amountDue = Math.max(0, this.total - paid);
    } else { // Crédit
      this.amountPaid = 0;
      this.amountDue = this.total;
    }
  }

  // wrappers UI
  payNow(){
    this.recompute();
    if (this.paymentType === 'Partial') {
      const paid = Number(this.amountPaid||0);
      if (!(paid > 0 && paid < this.total)) return; // validation simple
    }
    if (this.paymentType === 'Credit') {
      this.amountPaid = 0;
      this.amountDue = this.total;
    }
    this.pay.emit({
      paymentType: this.paymentType,
      paymentMode: this.paymentMethod,
      mobileOperator: this.paymentMethod==='MobileMoney'? this.mobileOperator: undefined,
      amountPaid: this.paymentType==='Total'? this.total :
                  this.paymentType==='Partial'? Number(this.amountPaid||0) : 0,
      amountDue: this.amountDue
    });
  }
  clearNow(){ this.clear.emit(); }

  onPaymentModeChange(mode: PaymentMode){
    this.paymentMethod = mode;
    this.changePayment.emit(mode);
  }
  onDiscountChange(v:any){
    const n = Number(v||0);
    this.changeDiscount.emit(n);
    setTimeout(()=> this.recompute(), 0);
  }
  onCashChange(v:any){ this.changeCash.emit(Number(v||0)); }
  onAmountPaidChange(v:any){ this.amountPaid = Math.max(0, Number(v||0)); this.recompute(); }
}