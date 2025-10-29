// import { Routes } from '@angular/router';
// import { TabsPage } from './tabs.page';

// export const routes: Routes = [
//   {
//     path: 'tabs',
//     component: TabsPage,
//     children: [
//       {
//         path: 'tab1',
//         loadComponent: () =>
//           import('../tab1/tab1.page').then((m) => m.Tab1Page),
//       },
//       {
//         path: 'tab2',
//         loadComponent: () =>
//           import('../tab2/tab2.page').then((m) => m.Tab2Page),
//       },
//       {
//         path: 'tab3',
//         loadComponent: () =>
//           import('../tab3/tab3.page').then((m) => m.Tab3Page),
//       },
//       {
//         path: '',
//         redirectTo: '/tabs/tab1',
//         pathMatch: 'full',
//       },
//     ],
//   },
//   {
//     path: '',
//     redirectTo: '/tabs/tab1',
//     pathMatch: 'full',
//   },
// ];



// tabs.routes.ts
import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path:'',
    loadComponent:()=>import('./tabs.page').then(m=>m.TabsPage),
    children:[
      { path:'', redirectTo:'home', pathMatch:'full' },
      { path:'home',       loadChildren:()=>import('../features/home/home.routes').then(m=>m.routes) },
      { path:'products',   loadChildren:()=>import('../features/products/products.route').then(m=>m.routes) },
      { path:'quick-sale', loadChildren:()=>import('../features/quick-sale/quick-sale.route').then(m=>m.routes  ) },
      { path:'settings',   loadChildren:()=>import('../features/settings/settings.route').then(m=>m.routes) },
      { path:'history',   loadChildren:()=>import('../features/sales-history/sales-hystory.route').then(m=>m.routes) },
      // { path:'sales-history',   loadChildren:()=>import('../features/sales-history/sales-hystory.route').then(m=>m.routes) },
    ]
  }
];