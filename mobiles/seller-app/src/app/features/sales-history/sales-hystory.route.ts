import { Routes } from '@angular/router';
export const routes: Routes = [

  { path: '', loadComponent: () => import('./sales-history.page').then(m => m.SalesHistoryPage) },
 
  { path: '', redirectTo: '', pathMatch: 'full' }


];