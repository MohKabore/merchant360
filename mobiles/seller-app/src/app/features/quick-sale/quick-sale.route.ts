import { Routes } from '@angular/router';
export const routes: Routes = [
  { path:'', loadComponent:()=>import('./quick-sale.page').then(m=>m.QuickSalePage) }
];