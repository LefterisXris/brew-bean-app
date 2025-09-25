import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoffeeService } from '../coffee.service';
import { Order } from '../models/coffee.model';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders-history.component.html',
  styleUrl: './orders-history.component.css'
})
export class OrdersHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;

  constructor(private coffeeService: CoffeeService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.coffeeService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders.sort((a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getTotalSpent(): number {
    return this.orders.reduce((total, order) => total + order.totalPrice, 0);
  }
}
