import { Injectable } from '@angular/core';
import { get, set } from 'idb-keyval';
import { faker } from '@faker-js/faker';
import { Customer } from '../models/customer';

const KEY = 'm360.customers.v3';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  // private async load(): Promise<Customer[]> {
  //   return (await get<Customer[]>(KEY)) ?? [];
  // }
  // private async save(arr: Customer[]) { await set(KEY, arr); }

  async all(): Promise<Customer[]> {
    const arr = await this.load();
    return arr.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
  }

  async search(q: string): Promise<Customer[]> {
    q = (q || '').toLowerCase().trim();
    if (!q) return this.all();
    const arr = await this.load();
    return arr.filter(c =>
      (`${c.firstName} ${c.lastName}`.toLowerCase().includes(q)) ||
      (c.phone?.toLowerCase().includes(q)) ||
      (c.email?.toLowerCase().includes(q)) ||
      (c.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  async getById(id: string): Promise<Customer | undefined> {
    const arr = await this.load();
    return arr.find(c => c.id === id);
  }

  async add(c: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<Customer> {
    const now = new Date().toISOString();
    const item: Customer = { ...c, createdAt: now, updatedAt: now };
    const arr = await this.load();
    arr.push(item);
    this.recomputeRanks(arr);
    await this.save(arr);
    return item;
  }

  async update(c: Customer): Promise<void> {
    const arr = await this.load();
    const i = arr.findIndex(x => x.id === c.id);
    if (i === -1) throw new Error('Customer not found');
    arr[i] = { ...c, updatedAt: new Date().toISOString() };
    this.recomputeRanks(arr);
    await this.save(arr);
  }

  async remove(id: string): Promise<void> {
    const arr = await this.load();
    const next = arr.filter(c => c.id !== id);
    this.recomputeRanks(next);
    await this.save(next);
  }

  private recomputeRanks(arr: Customer[]) {
    const vals = arr.map(c => c.totalSpent || 0).sort((a, b) => a - b);
    const n = vals.length || 1;
    for (const c of arr) {
      const v = c.totalSpent || 0;
      const idx = vals.findIndex(x => x >= v);
      const rank = (idx < 0 ? n - 1 : idx) / (n - 1 || 1);
      c.rankPct = Math.round(rank * 100); // 0..100
      c.avgBasket = (c.ordersCount || 0) ? Math.round(((c.totalSpent || 0) / (c.ordersCount || 1)) * 100) / 100 : 0;
    }
  }



  // Version pour liens WhatsApp: "+22501XXXXXXXX"
  static normalizePhoneForWa(phone?: string): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/\s|-/g, ''); // supprime espaces/tirets
  }

  async seedIfEmpty() {
    const cur = await this.load();
    if (cur.length) return;
    await this.seedFakeMany(200);
  }



  // ajout utilitaire format numéro affichage CI
  private genCIMobileDisplay(): string {
    const prefixes = ['01', '05', '07', '25'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const rnd2 = () => Math.floor(10 + Math.random() * 90); // 10..99
    return `+225 ${p} ${rnd2()} ${rnd2()} ${rnd2()} ${rnd2()}`;
  }

  

  // 🔤 Nom par défaut lorsque seul le numéro est connu
  static makeDefaultNameFromPhone(phone: string) {
    // Affichage: firstName="Client", lastName="225-01-23-45-67" (lisible et triable)
    const clean = (phone || '').replace(/\+/g, '').replace(/\s/g, '');
    const pretty = phone.replace('+', '').replace(/\s+/g, ' ').trim().replace(/ /g, '-');
    return { firstName: 'Client', lastName: pretty || clean || 'Inconnu' };
  }

  async seedFakeMany(count = 220) {
    const arr: Customer[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const onlyPhone = Math.random() < 0.18; // ~18% “numéro seul”

      let firstName = '';
      let lastName = '';
      const phone = this.genCIMobileDisplay();

      if (!onlyPhone) {
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
      } else {
        const d = CustomersService.makeDefaultNameFromPhone(phone);
        firstName = d.firstName;
        lastName = d.lastName;
      }

      const hasBuy = Math.random() > 0.2;
      const orders = hasBuy ? Math.floor(1 + Math.random() * 35) : 0;
      const total = hasBuy ? Math.floor(5000 + Math.random() * 1_995_000) : 0;
      const lastAt = hasBuy ? faker.date.recent({ days: 240 }).toISOString() : undefined;

      const tags: string[] = [];
      if (total > 800_000) tags.push('VIP');
      if (orders > 15) tags.push('Gros');
      if (Math.random() > 0.88) tags.push('Fidèle');

      const credit = hasBuy && Math.random() > 0.85 ? Math.floor(1000 + Math.random() * 150_000) : 0;

      arr.push({
        id: crypto.randomUUID(),
        firstName, lastName,
        phone,
        email: onlyPhone ? undefined : faker.internet.email({ firstName, lastName }).toLowerCase(),
        address: onlyPhone ? undefined : faker.location.streetAddress(),
        tags,
        notes: Math.random() < 0.25 ? faker.lorem.sentence({ min: 3, max: 8 }) : undefined,
        ordersCount: orders,
        totalSpent: total,
        avgBasket: orders ? Math.round((total / orders) * 100) / 100 : 0,
        lastPurchaseAt: lastAt,
        rankPct: 0,
        balance: credit,
        createdAt: now,
        updatedAt: now
      });
    }

    this.recomputeRanks(arr);
    await this.save(arr);
  }

  private async load(): Promise<Customer[]> { return (await get<Customer[]>(KEY)) ?? []; }
  private async save(arr: Customer[]) { await set(KEY, arr); }

  // ... (tes méthodes existantes: all, search, getById, add, update, remove, etc.)

  async addPayment(customerId: string, amount: number, note?: string): Promise<void> {
    const arr = await this.load();
    const i = arr.findIndex(c => c.id === customerId);
    if (i < 0) throw new Error('Client introuvable');
    const c = arr[i];

    const cur = c.balance || 0;
    c.balance = Math.max(0, cur - Math.max(0, amount));
    c.updatedAt = new Date().toISOString();

    // journal dans notes
    const n = { id: crypto.randomUUID(), text: `Règlement ${amount.toLocaleString()} XOF${note ? ' • ' + note : ''}`, createdAt: new Date().toISOString() };
    c.notes = [n, ...(c.notes ?? [])];

    arr[i] = c;
    await this.save(arr);
  }

  async addNote(customerId: string, text: string): Promise<void> {
    const arr = await this.load();
    const i = arr.findIndex(c => c.id === customerId);
    if (i < 0) throw new Error('Client introuvable');
    const c = arr[i];
    const n = { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() };
    c.notes = [n, ...(c.notes ?? [])];
    c.updatedAt = new Date().toISOString();
    arr[i] = c;
    await this.save(arr);
  }

  async toggleTag(customerId: string, tag: string): Promise<void> {
    const arr = await this.load();
    const i = arr.findIndex(c => c.id === customerId);
    if (i < 0) throw new Error('Client introuvable');
    const c = arr[i];
    const t = (c.tags ?? []);
    const idx = t.findIndex(x => x.toLowerCase() === tag.toLowerCase());
    if (idx >= 0) t.splice(idx, 1); else t.push(tag);
    c.tags = [...t];
    c.updatedAt = new Date().toISOString();
    arr[i] = c;
    await this.save(arr);
  }

  // helpers existants (ex. normalisation téléphone)
  static normalizePhoneForLink(phone?: string): string|undefined {
    if(!phone) return undefined;
    return phone.replace(/\s|-/g,'');
  }
}