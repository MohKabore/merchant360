import { Routes } from '@angular/router';
export const routes: Routes = [

  { path: '', loadComponent: () => import('./products.page').then(m => m.ProductsPage) },
  { path: 'new', loadComponent: () => import('./product-edit/product-edit.page').then(m => m.ProductEditPage) },
  { path: ':id', loadComponent: () => import('./product-edit/product-edit.page').then(m => m.ProductEditPage) },
  { path: '', redirectTo: '', pathMatch: 'full' }


];