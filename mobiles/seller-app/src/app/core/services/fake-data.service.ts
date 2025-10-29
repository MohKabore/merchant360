import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { set, get } from 'idb-keyval';
import { Category, Product } from '../models/dtos';
export type Sale = {
  id: string;
  createdAt: string;
  lines: any[];
  subTotal: number;
  discount: number;
  total: number;
  currency: string;
  paymentMethod: 'Cash' | 'MobileMoney' | 'Card';
  cash?: number;
  change?: number;
};
import dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';

const picsum = (seed: string, w = 400, h = 400) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
const KEY = 'sales.v1';
export type SaleLine = {
  name: string; qty: number; price: number;
  lineDiscount?: number;     // montant (pour % tu peux déjà avoir appliqué côté calcul)
  currency: string;
};



export type Totals = {
  count: number;
  revenue: number;
  average: number;
  byPayment: { Cash: number; Card: number; MobileMoney: number; };
};


@Injectable({ providedIn: 'root' })
export class FakeDataService {
  private cats: Category[] = [];
  private products: Product[] = [];
  private ready = false;
  private cache: Sale[] | null = null;
private countSub = new BehaviorSubject<number>(0);
  cartCount$: Observable<number> = this.countSub.asObservable();
  async init() {
    if (this.ready) return;
    const cached = await get('merchant360:seed:v1');
    if (cached) { this.cats = cached.cats; this.products = cached.products; this.ready = true; return; }

    faker.seed(42);
    this.cats = Array.from({ length: 10 }).map(() => {
      const name = faker.commerce.department();
      return { id: faker.string.uuid(), name, slug: name.toLowerCase().replace(/\s+/g, '-'), createdAt: new Date().toISOString() };
    });

    faker.seed(1337);
    this.products = Array.from({ length: 1000 }).map((_, i) => {
      const cat = this.cats[Math.floor(Math.random() * this.cats.length)];
      const name = faker.commerce.productName();
      return {
        id: faker.string.uuid(), tenantId: 'tenant-demo', name,
        slug: name.toLowerCase().replace(/\s+/g, '-'), sku: faker.string.alphanumeric({ length: 6, casing: 'upper' }),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price({ min: 300, max: 15000 })),
        currency: 'XOF', stockOnHand: faker.number.int({ min: 0, max: 150 }),
        categoryId: cat.id, images: [{ url: picsum(name + '-' + i) }],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        isActive: faker.datatype.boolean(0.9)
      };
    });

    await set('merchant360:seed:v1', { cats: this.cats, products: this.products });
    this.ready = true;
  }

  async listCategories() { await this.init(); return this.cats; }

  async listProducts(params?: { search?: string; categoryId?: string; skip?: number; take?: number }) {
    await this.init();
    const s = (params?.search ?? '').trim().toLowerCase();
    const c = params?.categoryId;
    let items = this.products;
    if (c) items = items.filter(p => p.categoryId === c);
    if (s) items = items.filter(p => p.name.toLowerCase().includes(s) || (p.description ?? '').toLowerCase().includes(s) || (p.sku ?? '').toLowerCase().includes(s));
    const skip = params?.skip ?? 0; const take = params?.take ?? 50;
    return items.slice(skip, skip + take);
  }

  private async saveCache() {
    await set('merchant360:seed:v1', { cats: this.cats, products: this.products });
  }

  private slugify(s: string) {
    return (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  async getProductById(id: string) {
    await this.init();
    return this.products.find(p => p.id === id) ?? null;
  }

  async upsertProduct(input: Partial<Product> & { id?: string }) {
    await this.init();

    // sanitize minimal
    const now = new Date().toISOString();
    const isNew = !input.id;

    const pId = input.id ?? faker.string.uuid();
    const cat = input.categoryId
      ? this.cats.find(c => c.id === input.categoryId) ?? this.cats[0]
      : this.cats[0];

    const existingIdx = this.products.findIndex(p => p.id === pId);

    const base: Product = existingIdx >= 0
      ? { ...this.products[existingIdx] }
      : {
        id: pId,
        tenantId: 'tenant-demo',
        name: '',
        slug: '',
        price: 0,
        currency: 'XOF',
        stockOnHand: 0,
        categoryId: cat.id,
        images: [],
        createdAt: now,
        isActive: true
      };

    const updated: Product = {
      ...base,
      ...input,
      name: (input.name ?? base.name).toString(),
      slug: this.slugify(input.slug ?? input.name ?? base.name ?? ''),
      updatedAt: now,
      categoryId: cat.id,
      images: (input as any)?.images ?? base.images
    };

    if (existingIdx >= 0) this.products[existingIdx] = updated;
    else this.products.unshift(updated); // nouveau en tête

    await this.saveCache();
    return updated;
  }

  async deleteProduct(id: string) {
    await this.init();
    this.products = this.products.filter(p => p.id !== id);
    await this.saveCache();
    return true;
  }


  //  private async load(): Promise<Sale[]>{
  //   if (this.cache) return this.cache;
  //   const arr = await get<Sale[]>(KEY) || [];
  //   this.cache = arr.sort((a,b)=> (b.createdAt.localeCompare(a.createdAt)));
  //   return this.cache;
  // }
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


  // private async save(arr: Sale[]){
  //   this.cache = arr;
  //   await set(KEY, arr);
  // }

  // async add(s: Sale){
  //   const arr = await this.load();
  //   arr.unshift(s);
  //   await this.save(arr);
  // }

  async list(): Promise<Sale[]>{
    return await this.load();
  }

  async getById(id: string): Promise<Sale | undefined>{
    const arr = await this.load();
    return arr.find(x => x.id === id);
  }

  async clearAll(){
    await this.save([]);
  }


  
  private async save(arr: Sale[]): Promise<void> {
    try {
      await set(KEY, arr);
    } catch {
      localStorage.setItem(KEY, JSON.stringify(arr));
    }
  }

  // ------- API -------
  async add(s: Sale): Promise<void> {
    const arr = await this.load();
    arr.push(s);
    await this.save(arr);
  }

  async all(): Promise<Sale[]> {
    const arr = await this.load();
    // tri du plus récent au plus ancien
    return arr.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  async between(start: Date, end: Date): Promise<Sale[]> {
    const all = await this.all();
    const s = start.toISOString(); const e = end.toISOString();
    return all.filter(x => x.createdAt >= s && x.createdAt <= e);
  }

  async remove(id: string): Promise<void> {
    const arr = await this.load();
    const next = arr.filter(x => x.id !== id);
    await this.save(next);
  }

  // async clear(): Promise<void> { await this.save([]); }

  totals(sales: Sale[]): Totals {
    const count = sales.length;
    const revenue = sales.reduce((n,s)=> n + s.total, 0);
    const average = count ? Math.round(revenue / count) : 0;
    const byPayment = { Cash:0, Card:0, MobileMoney:0 };
    for (const s of sales) { byPayment[s.paymentMethod] += s.total; }
    return { count, revenue, average, byPayment };
  }

  exportCsv(sales: Sale[]): Blob {
    const head = [
      'ID','Date','NbArticles','SousTotal','Remise','Total','Devise','Paiement','Payé','Monnaie'
    ].join(',');
    const rows = sales.map(s => {
      const nb = s.lines.reduce((n,l)=> n + l.qty, 0);
      return [
        s.id,
        dayjs(s.createdAt).format('YYYY-MM-DD HH:mm'),
        nb,
        s.subTotal,
        s.discount,
        s.total,
        s.currency,
        s.paymentMethod,
        s.cash,
        s.change
      ].join(',');
    });
    const csv = [head, ...rows].join('\n');
    return new Blob([csv], { type:'text/csv;charset=utf-8' });

    
  }
  setCount(n: number){ this.countSub.next(Math.max(0, n|0)); }
  inc(by=1){ this.setCount((this.countSub.value || 0) + by); }
  dec(by=1){ this.setCount((this.countSub.value || 0) - by); }
  clear(){ this.setCount(0); }

  ngOnDestroy(){ this.countSub.complete(); }
}