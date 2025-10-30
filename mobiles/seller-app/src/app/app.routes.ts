import { Routes } from '@angular/router';

export const routes: Routes = [
  { path:'', redirectTo:'tabs', pathMatch:'full' },

  // Shell Tabs (lazy)
  { path:'tabs', loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes) },

      { path:'sales-history',   loadChildren:()=>import('./features/sales-history/sales-hystory.route').then(m=>m.routes) },

  { path:'**', redirectTo:'tabs' },

 
];