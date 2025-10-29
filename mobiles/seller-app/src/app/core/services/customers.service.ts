// src/app/core/services/customers.service.ts
import { Injectable } from '@angular/core';
import { get, set } from 'idb-keyval';
import { Customer } from '../models/customer';

const KEY = 'm360.customers.v1';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private async load(): Promise<Customer[]> {
    return (await get<Customer[]>(KEY)) ?? [];
  }
  private async save(arr: Customer[]) {
    await set(KEY, arr);
  }

  async all(): Promise<Customer[]> {
    const arr = await this.load();
    return arr.sort((a,b)=> (b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt));
  }

  async search(q: string): Promise<Customer[]> {
    q = (q||'').toLowerCase().trim();
    if(!q) return this.all();
    const arr = await this.load();
    return arr.filter(c =>
      (c.name?.toLowerCase().includes(q)) ||
      (c.phone?.toLowerCase().includes(q)) ||
      (c.email?.toLowerCase().includes(q)) ||
      (c.tags||[]).some(t => t.toLowerCase().includes(q))
    );
  }

  async getById(id: string): Promise<Customer|undefined> {
    const arr = await this.load();
    return arr.find(c => c.id === id);
  }

  async add(c: Omit<Customer, 'createdAt'|'updatedAt'>): Promise<Customer> {
    const now = new Date().toISOString();
    const item: Customer = { ...c, createdAt: now, updatedAt: now };
    const arr = await this.load();
    arr.push(item);
    await this.save(arr);
    return item;
  }

  async update(c: Customer): Promise<void> {
    const arr = await this.load();
    const i = arr.findIndex(x => x.id === c.id);
    if (i === -1) throw new Error('Customer not found');
    arr[i] = { ...c, updatedAt: new Date().toISOString() };
    await this.save(arr);
  }

  async remove(id: string): Promise<void> {
    const arr = await this.load();
    await this.save(arr.filter(c => c.id !== id));
  }

  // Seed rapide (optionnel)
  async seedIfEmpty() {
    const arr = await this.load();
    if (arr.length) return;
    const now = new Date().toISOString();
    await this.save([
      { id: 'c1', name: 'Kouadio Aya', phone: '+225 01 23 45 67', tags:['VIP'], balance: 0, createdAt: now, updatedAt: now },
      { id: 'c2', name: 'Yao Eric', phone: '+225 07 89 10 11', tags:['Gros'], balance: 5000, createdAt: now, updatedAt: now },
    ]);
  }
}