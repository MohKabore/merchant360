import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FakeDataService } from 'src/app/core/services/fake-data.service';
import { Category, Product } from 'src/app/core/models/dtos';

@Component({
  standalone: true,
  selector: 'app-product-edit',
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './product-edit.page.html',
  styleUrls: ['./product-edit.page.scss']
})
export class ProductEditPage implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private data = inject(FakeDataService);
  private toast = inject(ToastController);

  id: string | null = null;
  isNew = true;
  categories: Category[] = [];

  // Galerie d’images (URLs base64 locales pour le moment)
  images: string[] = [];         // index 0 = couverture
  maxImages = 6;

  saving = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
    currency: ['XOF'],
    categoryId: ['', [Validators.required]],
    stockOnHand: [0, [Validators.required, Validators.min(0)]],
    isActive: [true],
    description: ['']
  });

  async ngOnInit(){
    this.categories = await this.data.listCategories();

    const paramId = this.route.snapshot.paramMap.get('id');
    this.isNew = !paramId || paramId === 'new';
    this.id = this.isNew ? null : paramId;

    if (!this.isNew && this.id){
      const p = await this.data.getProductById(this.id);
      if (p){
        this.form.patchValue({
          name: p.name,
          price: p.price,
          currency: p.currency,
          categoryId: p.categoryId,
          stockOnHand: p.stockOnHand,
          isActive: p.isActive,
          description: p.description ?? ''
        });
        this.images = (p.images ?? []).map(x => x.url).slice(0, this.maxImages);
      } else {
        this.router.navigateByUrl('/product/new');
      }
    } else {
      if (this.categories.length > 0 && !this.form.value.categoryId){
        this.form.patchValue({ categoryId: this.categories[0].id });
      }
    }
  }

  private readFilesAsDataUrls(files: File[]): Promise<string[]> {
    const toUrl = (f: File) => new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(f);
    });
    return Promise.all(files.map(toUrl));
  }

  async onFilesSelected(ev: Event){
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    const remain = this.maxImages - this.images.length;
    const picked = files.slice(0, remain);
    const urls = await this.readFilesAsDataUrls(picked);
    this.images = [...this.images, ...urls];

    // reset input pour pouvoir re-sélectionner la même image si besoin
    input.value = '';
  }

  setCover(i: number){
    if (i<=0 || i>=this.images.length) return;
    const arr = [...this.images];
    const [img] = arr.splice(i,1);
    this.images = [img, ...arr]; // passe en couverture (index 0)
  }

  removeImage(i: number){
    this.images = this.images.filter((_,idx)=> idx !== i);
  }

  moveLeft(i: number){
    if (i<=0) return;
    const arr = [...this.images];
    [arr[i-1], arr[i]] = [arr[i], arr[i-1]];
    this.images = arr;
  }

  moveRight(i: number){
    if (i>=this.images.length-1) return;
    const arr = [...this.images];
    [arr[i+1], arr[i]] = [arr[i], arr[i+1]];
    this.images = arr;
  }

  async save(){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({ message: 'Corrige les champs en rouge', duration: 1500, color: 'warning'})).present();
      return;
    }
    this.saving = true;

    const v = this.form.getRawValue();
    const payload: Partial<Product> = {
      id: this.id ?? undefined,
      name: v.name!,
      price: Number(v.price),
      currency: v.currency!,
      categoryId: v.categoryId!,
      stockOnHand: Number(v.stockOnHand),
      isActive: !!v.isActive,
      description: v.description ?? '',
      images: this.images.map(url => ({ url }))        // 👈 multi-images
    };

    await this.data.upsertProduct(payload);
    this.saving = false;

    (await this.toast.create({ message: 'Produit enregistré', duration: 1200, color: 'success'})).present();
    this.router.navigateByUrl('/tabs/products');
  }

  cancel(){ this.router.navigateByUrl('/tabs/products'); }

  get f(){ return this.form.controls; }
}