import { Injectable } from '@angular/core';
import { faker } from '@faker-js/faker';
import { set, get } from 'idb-keyval';
import { Category, Product } from '../models/dtos';

const picsum = (seed:string,w=400,h=400)=>`https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

@Injectable({ providedIn:'root' })
export class FakeDataService {
  private cats:Category[]=[]; private products:Product[]=[]; private ready=false;

  async init(){
    if(this.ready) return;
    const cached = await get('merchant360:seed:v1');
    if(cached){ this.cats=cached.cats; this.products=cached.products; this.ready=true; return; }

    faker.seed(42);
    this.cats = Array.from({length:10}).map(()=> {
      const name = faker.commerce.department();
      return { id:faker.string.uuid(), name, slug:name.toLowerCase().replace(/\s+/g,'-'), createdAt:new Date().toISOString() };
    });

    faker.seed(1337);
    this.products = Array.from({length:1000}).map((_,i)=>{
      const cat = this.cats[Math.floor(Math.random()*this.cats.length)];
      const name = faker.commerce.productName();
      return {
        id:faker.string.uuid(), tenantId:'tenant-demo', name,
        slug:name.toLowerCase().replace(/\s+/g,'-'), sku:faker.string.alphanumeric({length:6, casing:'upper'}),
        description:faker.commerce.productDescription(),
        price:Number(faker.commerce.price({min:300,max:15000})),
        currency:'XOF', stockOnHand:faker.number.int({min:0,max:150}),
        categoryId:cat.id, images:[{url:picsum(name+'-'+i)}],
        createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
        isActive:faker.datatype.boolean(0.9)
      };
    });

    await set('merchant360:seed:v1', { cats:this.cats, products:this.products });
    this.ready=true;
  }

  async listCategories(){ await this.init(); return this.cats; }

  async listProducts(params?:{search?:string; categoryId?:string; skip?:number; take?:number}){
    await this.init();
    const s = (params?.search ?? '').trim().toLowerCase();
    const c = params?.categoryId;
    let items = this.products;
    if(c) items = items.filter(p=>p.categoryId===c);
    if(s) items = items.filter(p => p.name.toLowerCase().includes(s) || (p.description??'').toLowerCase().includes(s) || (p.sku??'').toLowerCase().includes(s));
    const skip = params?.skip ?? 0; const take = params?.take ?? 50;
    return items.slice(skip, skip+take);
  }
}