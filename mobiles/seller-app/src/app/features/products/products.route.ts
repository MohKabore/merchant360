import { Routes } from '@angular/router';
export const routes: Routes = [
  { path:'', loadComponent:()=>import('./products.page').then(m=>m.ProductsPage) }
];