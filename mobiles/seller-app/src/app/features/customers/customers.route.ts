// src/app/features/customers/customers.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',           loadComponent: () => import('./customers-list/customers-list.page').then(m => m.CustomersListPage) },
//   { path: 'new',        loadComponent: () => import('./customer-edit.page').then(m => m.CustomerEditPage) },
//   { path: ':id',        loadComponent: () => import('./customer-edit.page').then(m => m.CustomerEditPage) }, // edit
];