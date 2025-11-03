import { Injectable } from '@angular/core';
import { get, set } from 'idb-keyval';

export type PaymentKind = 'total' | 'partial' | 'credit';
export type PaymentMode = 'cash' | 'card' | 'mobile';
export type SaleStatus = 'paid' | 'partial' | 'credit' | 'canceled';

export interface SaleLine {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;    // XOF
  discountPct?: number; // remise % ligne
}

export interface Sale {
  id: string;
  date: string; // ISO
  customerId?: string;
  customerName?: string; // snapshot affichage
  customerPhone?: string;

  lines: SaleLine[];
  subTotal: number; // somme qty*unitPrice avant remises globales
  discountPct?: number; // remise globale %
  total: number;   // total final TTC (ici sans TVA pour simple)

  paymentKind: PaymentKind;
  paymentMode?: PaymentMode;
  paidAmount: number;    // montant réglé (0 si crédit)
  restToPay: number;     // = total - paidAmount si > 0
  status: SaleStatus;    // paid/partial/credit/canceled

  note?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

const KEY = 'm360.sales.v1';

@Injectable({ providedIn: 'root' })
export class SalesService {

   private async load(): Promise<Sale[]> {
    try {
      const arr = await get(KEY) as Sale[] | undefined;
      return Array.isArray(arr) ? arr : [];
    } catch {
      // fallback localStorage
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) as Sale[] : [];
    }
  }

  // Seed de test
  async seedIfEmpty(){
    const cur = await this.load();
    if (cur.length) return;

    const now = new Date();
    const sample: Sale[] = [];
    const rnd = (min:number,max:number)=>Math.floor(min+Math.random()*(max-min+1));
    const names = ['Client 225-01-22-33-44', 'A. Kouadio', 'M. Dosso', 'S. Traoré', 'N. Koné', 'Client 225-05-88-77-66'];
    const phones= ['+225 01 22 33 44 55', '+225 07 18 77 45 20', '+225 05 90 12 34 56', '+225 25 66 11 22 33', '+225 01 45 87 96 10', '+225 07 34 12 67 89'];

    for (let i=0;i<45;i++){
      const d = new Date(now.getTime() - rnd(0, 25)*24*3600*1000 - rnd(0, 18)*3600*1000);
      const lineCount = rnd(1,3);
      const lines: SaleLine[] = Array.from({length:lineCount}).map((_,k)=>({
        productId: crypto.randomUUID(),
        name: ['Shampoo Pro 500ml','Huile de coco','Peigne afro','Lotion hydratante','Gel coiffant'][rnd(0,4)],
        qty: rnd(1,3),
        unitPrice: [2500, 3500, 1500, 4000, 2000][rnd(0,4)],
        discountPct: Math.random()>0.8 ? 10 : 0
      }));
      const sub = lines.reduce((s,l)=>s + l.qty*l.unitPrice*(1 - (l.discountPct||0)/100), 0);
      const disc = Math.random()>0.85 ? 5 : 0;
      const tot = Math.round(sub * (1 - disc/100));

      const kind: PaymentKind = (Math.random()>0.8) ? 'partial' : (Math.random()>0.9 ? 'credit' : 'total');
      const mode: PaymentMode = ['cash','card','mobile'][rnd(0,2)];
      const paid = kind==='total' ? tot : (kind==='partial' ? Math.round(tot*0.4) : 0);
      const left = Math.max(0, tot - paid);

      const status: SaleStatus =
        (left===0) ? 'paid' : (paid>0 ? 'partial' : 'credit');

      const ix = rnd(0, names.length-1);

      sample.push({
        id: crypto.randomUUID(),
        date: d.toISOString(),
        customerId: crypto.randomUUID(),
        customerName: names[ix],
        customerPhone: phones[ix],
        lines,
        subTotal: sub,
        discountPct: disc,
        total: tot,
        paymentKind: kind,
        paymentMode: mode,
        paidAmount: paid,
        restToPay: left,
        status,
        note: Math.random()>0.85 ? 'Client fidèle' : undefined,
        createdAt: d.toISOString(),
        updatedAt: d.toISOString()
      });
    }

    // injecte 1 vente annulée pour voir l’état
    if (sample.length){
      sample[3].status = 'canceled';
      sample[3].canceledAt = new Date(now.getTime()-3*3600*1000).toISOString();
    }

    await this.save(sample);
  }

  async all(): Promise<Sale[]>{
    return (await this.load()).sort((a,b)=> new Date(b.date).getTime() - new Date(a.date).getTime());
  }


  async getById(id:string){ return (await this.load()).find(s=>s.id===id); }

  async add(s: Omit<Sale,'id'|'createdAt'|'updatedAt'|'status'|'restToPay'>){
    const arr = await this.load();
    const rest = Math.max(0, s.total - (s.paidAmount||0));
    const status: SaleStatus = (rest===0) ? 'paid' : ((s.paidAmount||0)>0 ? 'partial' : 'credit');

    const now = new Date().toISOString();
    arr.unshift({ ...s, id: crypto.randomUUID(), restToPay: rest, status, createdAt: now, updatedAt: now });
    await this.save(arr);
  }

  async update(id:string, patch: Partial<Sale>){
    const arr = await this.load();
    const i = arr.findIndex(x=>x.id===id);
    if (i<0) throw new Error('Vente introuvable');
    const cur = { ...arr[i], ...patch };
    if (patch.paidAmount!==undefined || patch.total!==undefined){
      const rest = Math.max(0, (patch.total ?? cur.total) - (patch.paidAmount ?? cur.paidAmount));
      cur.restToPay = rest;
      cur.status = (cur.canceledAt) ? 'canceled' : (rest===0 ? 'paid' : (cur.paidAmount>0 ? 'partial' : 'credit'));
    }
    cur.updatedAt = new Date().toISOString();
    arr[i] = cur;
    await this.save(arr);
    return cur;
  }

  async cancel(id:string){
    return this.update(id, { status:'canceled', canceledAt: new Date().toISOString() });
  }

  // Helpers
  static fmtMoney(n:number){ return (n||0).toLocaleString(); }
}