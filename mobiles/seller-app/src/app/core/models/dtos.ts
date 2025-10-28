export interface Category { id:string; name:string; slug:string; createdAt:string; }
export interface ProductImage { url:string; alt?:string; }
export interface Product {
  id:string; tenantId:string; name:string; slug:string; sku?:string;
  description?:string; price:number; currency:'XOF'|string;
  stockOnHand:number; categoryId:string; images:ProductImage[];
  createdAt:string; updatedAt?:string; isActive:boolean;
}