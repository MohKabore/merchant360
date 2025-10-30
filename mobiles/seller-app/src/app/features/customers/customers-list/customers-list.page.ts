import { Component } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons,
  IonContent, IonList, IonItem, IonLabel, IonSearchbar,
  IonButton, IonIcon, IonBadge, IonFab, IonFabButton,
  IonSegment, IonSegmentButton, IonAvatar,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { CustomersService } from 'src/app/core/services/customers.service';
import { Customer } from 'src/app/core/models/customer';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';

type FilterKey = 'all'|'vip'|'gros'|'debt'|'top20';
type Group = { key: string; items: Customer[] };

@Component({
  standalone: true,
  selector: 'app-customers-list',
  templateUrl: './customers-list.page.html',
  styleUrls: ['./customers-list.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonContent, IonList, IonItem, IonLabel, IonSearchbar,
    IonButton, IonIcon, IonBadge, IonFab, IonFabButton,
    IonSegment, IonSegmentButton, IonAvatar,FormsModule,
    IonItemSliding, IonItemOptions, IonItemOption
  ]
})
export class CustomersListPage {
  q = '';
  loading = true;

  items: Customer[] = [];
  filtered: Customer[] = [];
  groups: Group[] = [];

  quick: FilterKey = 'all';
  ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  constructor(private svc: CustomersService, private router: Router){}

  async ionViewWillEnter(){
    await this.svc.seedIfEmpty();
    this.loading = true;
    this.items = await this.svc.all();
    this.apply();
    this.loading = false;
  }

  async onSearch(){
    const base = this.q ? await this.svc.search(this.q) : await this.svc.all();
    this.items = base;
    this.apply();
  }

  onQuickChange(){ this.apply(); }

  private apply(){
    const key = this.quick;
    let arr = [...this.items];

    if (key === 'vip')   arr = arr.filter(c => (c.tags||[]).some(t => t.toLowerCase() === 'vip'));
    if (key === 'gros')  arr = arr.filter(c => (c.tags||[]).some(t => t.toLowerCase() === 'gros'));
    if (key === 'debt')  arr = arr.filter(c => (c.balance||0) > 0);
    if (key === 'top20') arr = arr.filter(c => (c.rankPct||0) >= 80);

    // Tri Nom puis Prénom
    arr.sort((a,b)=>{
      const al = (a.lastName||'').localeCompare(b.lastName||'', 'fr', {sensitivity:'base'});
      if (al !== 0) return al;
      return (a.firstName||'').localeCompare(b.firstName||'', 'fr', {sensitivity:'base'});
    });

    this.filtered = arr;
    this.buildGroups();
  }

  private buildGroups(){
    const map = new Map<string, Customer[]>();
    for (const c of this.filtered){
      const letter = ((c.lastName||c.firstName||'')[0] || '#').toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : '#';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    const keys = [...map.keys()].sort((a,b)=>{
      if (a==='#') return 1; if (b==='#') return -1;
      return a.localeCompare(b);
    });
    this.groups = keys.map(k => ({ key:k, items: map.get(k)! }));
  }

  // Helpers UI
  // initials(c: Customer){
  //   const a = (c.firstName?.[0]||'').toUpperCase();
  //   const b = (c.lastName?.[0]||'').toUpperCase();
  //   return (a + b) || 'C';
  // }
  // fullName(c: Customer){ return `${c.firstName} ${c.lastName}`.trim(); }
  lastPurchaseTxt(c: Customer){
    return c.lastPurchaseAt ? formatDate(c.lastPurchaseAt, 'dd MMM yyyy', 'fr') : 'Jamais';
  }
  volBadgeColor(c: Customer){
    const t = c.totalSpent||0;
    if (t > 1_000_000) return 'tertiary';
    if (t > 300_000)  return 'success';
    if (t > 50_000)   return 'medium';
    return 'light';
  }
  rankChip(c: Customer){
    const p = c.rankPct ?? 0;
    if (p >= 90) return 'Top 10%';
    if (p >= 75) return 'Top 25%';
    if (p >= 50) return 'Top 50%';
    return null;
  }

  // Actions
  goNew(){ this.router.navigateByUrl('/tabs/customers/new'); }
  goEdit(c: Customer){ this.router.navigate(['/tabs/customers', c.id]); }
  // call(c: Customer){ if(!c.phone) return; window.location.href = `tel:${c.phone}`; }
  // whatsapp(c: Customer){
  //   const clean = CustomersService.normalizePhoneForWa(c.phone);
  //   if(!clean) return;
  //   const msg = encodeURIComponent(`Bonjour ${this.fullName(c)}, ici votre boutique Merchant360.`);
  //   window.open(`https://wa.me/${clean}?text=${msg}`,'_blank');
  // }
  async remove(c: Customer){
    if(!confirm(`Supprimer ${this.fullName(c)} ?`)) return;
    await this.svc.remove(c.id);
    this.items = await this.svc.all();
    this.apply();
  }

  // Index A–Z
  jumpTo(letter: string){
    const el = document.getElementById(`idx-${letter}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  initials(c: Customer){
  const a = (c.firstName?.[0]||'').toUpperCase();
  const b = (c.lastName?.[0]||'').toUpperCase();
  return (a+b) || 'C';
}
fullName(c: Customer){ return `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(); }

call(c: Customer){
  const tel = CustomersService.normalizePhoneForLink(c.phone);
  if(!tel) return;
  window.location.href = `tel:${tel}`;
}
whatsapp(c: Customer){
  const tel = CustomersService.normalizePhoneForLink(c.phone);
  if(!tel) return;
  const label = this.fullName(c) || 'Client';
  const msg = encodeURIComponent(`Bonjour ${label}, ici votre boutique Merchant360.`);
  window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
}
}