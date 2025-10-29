import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController, AlertController } from '@ionic/angular';
import dayjs from 'dayjs';
import { FakeDataService, Sale } from 'src/app/core/services/fake-data.service';
import { ReceiptModalComponent } from '../quick-sale/receipt-modal/receipt-modal.component';

type RangeQuick = 'today'|'week'|'range';
type PaymentMode = 'Cash'|'Card'|'MobileMoney';

@Component({
  standalone: true,
  selector: 'app-sales-history',
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './sales-history.page.html',
  styleUrls: ['./sales-history.page.scss'],
})
export class SalesHistoryPage implements OnInit {
  private sales = inject(FakeDataService);
  private modal = inject(ModalController);
  private toast = inject(ToastController);
  private alert = inject(AlertController);

  // UI/filters
  range: RangeQuick = 'today';
  q = '';
  payFilter: PaymentMode | 'All' = 'All';
  start?: string; // yyyy-MM-dd
  end?: string;

  loading = false;

  // data
  allSales: Sale[] = [];
  list: Sale[] = [];

  // kpis
  currency = 'XOF';
  kpiCount = 0;
  kpiRevenue = 0;
  kpiAverage = 0;
  kpiCash = 0;
  kpiCard = 0;
  kpiMobile = 0;

  async ngOnInit(){ await this.reload(); }

  async reload(){
    this.loading = true;
    if (this.range === 'today') {
      const s = dayjs().startOf('day').toDate();
      const e = dayjs().endOf('day').toDate();
      this.allSales = await this.sales.between(s, e);
    } else if (this.range === 'week') {
      const s = dayjs().startOf('week').toDate();
      const e = dayjs().endOf('week').toDate();
      this.allSales = await this.sales.between(s, e);
    } else {
      const s = this.start ? dayjs(this.start).startOf('day').toDate() : new Date(0);
      const e = this.end   ? dayjs(this.end).endOf('day').toDate()   : new Date();
      this.allSales = await this.sales.between(s, e);
    }
    this.currency = this.allSales[0]?.currency ?? 'XOF';
    this.applyFilters();
    this.loading = false;
  }

  onQuickChange(val: RangeQuick){
    this.range = val;
    if (val !== 'range') { this.start = this.end = undefined; }
    this.reload();
  }
  onDateChange(){ if (this.range==='range') this.reload(); }
  onSearchChange(){ this.applyFilters(); }
  onPaymentFilterChange(){ this.applyFilters(); }

  applyFilters(){
    const text = (this.q || '').trim().toLowerCase();
    const mode = this.payFilter;

    const filtered = this.allSales.filter(s => {
      const okText = !text
        || s.id.toLowerCase().includes(text)
        || s.lines.some(l => l.name.toLowerCase().includes(text));
      const okPay = mode === 'All' || s.paymentMethod === mode;
      return okText && okPay;
    }).sort((a,b)=> b.createdAt.localeCompare(a.createdAt));

    this.list = filtered;
    this.computeKpis();
  }

  totalLines(s: Sale){ return s.lines.reduce((n,l)=> n + l.qty, 0); }

  computeKpis(){
    this.kpiCount = this.list.length;
    this.kpiRevenue = this.list.reduce((n,s)=> n + s.total, 0);
    this.kpiAverage = this.kpiCount ? Math.round(this.kpiRevenue / this.kpiCount) : 0;
    this.kpiCash = this.list.filter(s=>s.paymentMethod==='Cash').reduce((n,s)=> n+s.total, 0);
    this.kpiCard = this.list.filter(s=>s.paymentMethod==='Card').reduce((n,s)=> n+s.total, 0);
    this.kpiMobile = this.list.filter(s=>s.paymentMethod==='MobileMoney').reduce((n,s)=> n+s.total, 0);
  }

  async openReceipt(s: Sale){
    const m = await this.modal.create({
      component: ReceiptModalComponent,
      componentProps: {
        receipt: {
          id: s.id, createdAt: s.createdAt,
          merchant: { name:'Merchant360 Demo', address:'Abidjan – Côte d’Ivoire', phone:'+225 xx xx xx xx' },
          paymentMethod: s.paymentMethod,
          currency: s.currency,
          lines: s.lines,
          subTotal: s.subTotal,
          discount: s.discount,
          total: s.total,
          cash: s.cash,
          change: s.change
        }
      },
      breakpoints: [0, .5, .9],
      initialBreakpoint: .9
    });
    await m.present();
  }

  async exportCsv(){
    const blob = this.sales.exportCsv(this.list);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `sales_${dayjs().format('YYYYMMDD_HHmm')}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    (await this.toast.create({ message:'Export CSV généré', duration:1400, color:'success', position:'top' })).present();
  }

  async removeSale(s: Sale){
    const a = await this.alert.create({
      header: 'Suppression',
      message: `Supprimer la vente <b>${s.id}</b> ?`,
      buttons: [
        { text:'Annuler', role:'cancel' },
        { text:'Supprimer', role:'destructive', handler: async ()=>{
          await this.sales.remove(s.id);
          await this.reload();
          (await this.toast.create({ message:'Vente supprimée', duration:1200, color:'success' })).present();
        } }
      ]
    });
    await a.present();
  }
}