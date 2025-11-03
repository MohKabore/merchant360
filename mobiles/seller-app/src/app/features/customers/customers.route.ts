// src/app/features/customers/customers.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',           loadComponent: () => import('./customers-list/customers-list.page').then(m => m.CustomersListPage) },
    { path: ':id',        loadComponent: () => import('./customer-detail/customer-detail.page').then(m => m.CustomerDetailPage) }, // edit
    // { path: 'new',        loadComponent: () => import('./customer-edit.page').then(m => m.CustomerEditPage) },
];