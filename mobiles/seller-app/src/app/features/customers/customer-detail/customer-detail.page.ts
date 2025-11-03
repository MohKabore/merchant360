import { Component, effect, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
  IonModal, IonInput, IonTextarea, IonToggle, IonNote
} from '@ionic/angular/standalone';
import { CommonModule, formatDate, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersService } from 'src/app/core/services/customers.service';
import { Customer } from 'src/app/core/models/customer';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.page.html',
  styleUrls: ['./customer-detail.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonList, IonItem, IonLabel, IonBadge, IonButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol,
    IonModal, IonInput, IonTextarea, IonToggle,NgFor, IonNote
  ]
})
export class CustomerDetailPage {
  id = '';
  loading = true;

  c?: Customer;

  // Modals
  payOpen = false;
  noteOpen = false;

  // Form modals
  payAmount: number | null = null;
  payNote = '';
  noteText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CustomersService
  ){}

  async ionViewWillEnter(){
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (!this.id) { this.router.navigateByUrl('/tabs/customers'); return; }
    this.loading = true;
    this.c = await this.svc.getById(this.id);
    this.loading = false;
  }

  initials(){
    if(!this.c) return 'C';
    const a = (this.c.firstName?.[0]||'').toUpperCase();
    const b = (this.c.lastName?.[0]||'').toUpperCase();
    return (a+b) || 'C';
  }
  fullName(){ return this.c ? `${this.c.firstName ?? ''} ${this.c.lastName ?? ''}`.trim() : ''; }
  lastPurchaseTxt(){
    return (this.c?.lastPurchaseAt) ? formatDate(this.c!.lastPurchaseAt, 'dd MMM yyyy', 'fr') : 'Jamais';
  }
  volBadgeColor(){
    const t = this.c?.totalSpent||0;
    if (t > 1_000_000) return 'tertiary';
    if (t > 300_000)  return 'success';
    if (t > 50_000)   return 'medium';
    return 'light';
  }

  call(){
    const tel = CustomersService.normalizePhoneForLink(this.c?.phone);
    if(!tel) return;
    window.location.href = `tel:${tel}`;
  }
  whatsapp(){
    const tel = CustomersService.normalizePhoneForLink(this.c?.phone);
    if(!tel) return;
    const label = this.fullName() || 'Client';
    const msg = encodeURIComponent(`Bonjour ${label}, ici votre boutique Merchant360.`);
    window.open(`https://wa.me/${tel}?text=${msg}`, '_blank');
  }

  async toggleTag(tag: 'VIP'|'Gros'|'Fidèle'){
    if(!this.c) return;
    await this.svc.toggleTag(this.c.id, tag);
    this.c = await this.svc.getById(this.c.id); // refresh
  }

  // Actions
  newSale(){
    // navigation vers Quick Sale avec client pré-sélectionné (à gérer côté POS)
    this.router.navigate(['/tabs/quick-sale'], { queryParams: { customerId: this.c?.id }});
  }

  // Paiement
  openPay(){ this.payAmount = null; this.payNote=''; this.payOpen = true; }
  async doPay(){
    if(!this.c || !this.payAmount || this.payAmount<=0) return;
    await this.svc.addPayment(this.c.id, this.payAmount, this.payNote || undefined);
    this.payOpen = false;
    this.c = await this.svc.getById(this.c.id);
    alert('Règlement enregistré');
  }

  // Note
  openNote(){ this.noteText=''; this.noteOpen = true; }
  async doNote(){
    if(!this.c || !this.noteText.trim()) return;
    await this.svc.addNote(this.c.id, this.noteText.trim());
    this.noteOpen = false;
    this.c = await this.svc.getById(this.c.id);
    alert('Note ajoutée');
  }
}