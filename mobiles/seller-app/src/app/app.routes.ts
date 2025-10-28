import { Routes } from '@angular/router';

export const routes: Routes = [
  { path:'', redirectTo:'tabs', pathMatch:'full' },

  // Shell Tabs (lazy)
  { path:'tabs', loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes) },

  // Pages “push” hors tabs (lazy)
  // { path:'product/:id', loadChildren: () => import('./features/product-edit/product-edit.routes').then(m => m.PRODUCT_EDIT_ROUTES) },

  { path:'**', redirectTo:'tabs' },
  {
    path: 'product-edit',
    loadComponent: () => import('./features/products/product-edit/product-edit.page').then( m => m.ProductEditPage)
  },
 
  // {
  //   path: 'filter-sheet',
  //   loadComponent: () => import('./features/filter-sheet/filter-sheet.page').then( m => m.FilterSheetPage)
  // },
  // {
  //   path: 'quick-sale',
  //   loadComponent: () => import('./features/quick-sale/quick-sale.page').then( m => m.QuickSalePage)
  // }
];