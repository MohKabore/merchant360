import { Component } from '@angular/core';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Category, Product } from 'src/app/core/models/dtos';
import { FakeDataService } from 'src/app/core/services/fake-data.service';
import { CategoryChipsComponent } from 'src/app/core/ui/category-chips/category-chips.component';
import { ProductItemComponent } from 'src/app/core/ui/product-item/product-item.component';
import { SearchToolbarComponent } from 'src/app/core/ui/search-toolbar/search-toolbar.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CategoryDockComponent } from 'src/app/core/ui/category-dock/category-dock.component';
import { CategoryGridComponent } from 'src/app/core/ui/category-grid/category-grid.component';

@Component({
  standalone:true,
  selector:'app-products',
  imports:[CommonModule, IonicModule, FormsModule, SearchToolbarComponent
    , CategoryDockComponent
    // ,CategoryGridComponent
    , ProductItemComponent
  ],
  templateUrl:'./products.page.html',
  styleUrls:['./products.page.scss']
})
export class ProductsPage {
  constructor(
    private data:FakeDataService,
    private alert:AlertController,
    private toast:ToastController,
    private router:Router,
     private sanitizer: DomSanitizer
  ) {}

  // état simple
  loading=true; categories:Category[]=[]; items:Product[]=[];
  search=''; selectedCategoryId:string|null=null;
  skip=0; pageSize=50; eof=false;

  async ionViewWillEnter(){ await this.init(); }

  async init(){
    this.loading=true;
    this.categories = await this.data.listCategories();
    this.skip=0; this.eof=false;
    await this.reloadList(true);
    this.loading=false;
  }

  addSvg: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512" fill="white">
        <path d="M256 112c13.3 0 24 10.7 24 24v96h96c13.3 0 24 10.7 24 24s-10.7 24-24 24h-96v96c0 13.3-10.7 24-24 24s-24-10.7-24-24v-96h-96c-13.3 0-24-10.7-24-24s10.7-24 24-24h96v-96c0-13.3 10.7-24 24-24z"/>
      </svg>
    `)
  );

  async onSearchChange(val:string){ this.search = val; this.skip=0; this.eof=false; await this.reloadList(true); }
  async onCategoryChange(id:string|null){ this.selectedCategoryId = id; this.skip=0; this.eof=false; await this.reloadList(true); }

  async reloadList(reset:boolean=false){
    const res = await this.data.listProducts({ search:this.search, categoryId:this.selectedCategoryId??undefined, skip:this.skip, take:this.pageSize });
    this.items = reset ? res : [...this.items, ...res];
    if(res.length < this.pageSize) this.eof = true;
  }

  async loadMore(){ if(this.eof) return; this.skip += this.pageSize; await this.reloadList(false); }

  goNew(){ this.router.navigateByUrl('/product/new'); }
  goEdit(id:string){ this.router.navigate(['tabs/products', id]); }

  async confirmDelete(p:Product){
    const a = await this.alert.create({
      header:'Supprimer', message:`Supprimer <b>${p.name}</b> ?`,
      buttons:[{text:'Annuler',role:'cancel'},{text:'Supprimer',role:'destructive',handler:async()=>{
        // mock delete local
        this.items = this.items.filter(x=>x.id!==p.id);
        (await this.toast.create({message:'Produit supprimé',duration:1200})).present();
      }}]
    }); await a.present();
  }

  trackId(_:number,p:Product){ return p.id; }
  get totalLabel(){ return `${this.items.length}${this.eof ? '' : '+'}`; }
}