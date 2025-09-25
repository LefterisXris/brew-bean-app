import { Routes } from '@angular/router';
import { CoffeeOrderComponent } from './coffee-order/coffee-order.component';
import { OrdersHistoryComponent } from './orders-history/orders-history.component';

export const routes: Routes = [
  { path: '', redirectTo: '/order', pathMatch: 'full' },
  { path: 'order', component: CoffeeOrderComponent },
  { path: 'history', component: OrdersHistoryComponent }
];
