import { Routes } from '@angular/router';

export const routes: Routes = [
  { path:'', redirectTo:'tabs', pathMatch:'full' },

  // Shell Tabs (lazy)
  { path:'tabs', loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes) },

  // Pages “push” hors tabs (lazy)
  // { path:'product/:id', loadChildren: () => import('./features/product-edit/product-edit.routes').then(m => m.PRODUCT_EDIT_ROUTES) },
      { path:'sales-history',   loadChildren:()=>import('./features/sales-history/sales-hystory.route').then(m=>m.routes) },

  { path:'**', redirectTo:'tabs' },
 
];