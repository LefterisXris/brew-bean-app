import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoffeeService } from '../coffee.service';
import { Coffee, Order } from '../models/coffee.model';

@Component({
  selector: 'app-coffee-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coffee-order.component.html',
  styleUrl: './coffee-order.component.css'
})
export class CoffeeOrderComponent implements OnInit {
  coffees: Coffee[] = [];
  selectedCoffee: Coffee | null = null;
  quantity: number = 1;
  customerName: string = '';
  orderPlaced: boolean = false;

  constructor(private coffeeService: CoffeeService) {}

  ngOnInit(): void {
    this.loadCoffees();
  }

  loadCoffees(): void {
    this.coffeeService.getCoffees().subscribe({
      next: (coffees) => {
        this.coffees = coffees;
      },
      error: (error) => {
        console.error('Error loading coffees:', error);
      }
    });
  }

  selectCoffee(coffee: Coffee): void {
    this.selectedCoffee = coffee;
  }

  placeOrder(): void {
    if (!this.selectedCoffee || !this.customerName.trim()) {
      return;
    }

    const order: Omit<Order, 'id'> = {
      coffee: this.selectedCoffee,
      quantity: this.quantity,
      totalPrice: this.selectedCoffee.price * this.quantity,
      orderDate: new Date().toISOString(),
      customerName: this.customerName.trim()
    };

    this.coffeeService.placeOrder(order).subscribe({
      next: (placedOrder) => {
        console.log('Order placed:', placedOrder);
        this.orderPlaced = true;
        this.resetForm();
      },
      error: (error) => {
        console.error('Error placing order:', error);
      }
    });
  }

  resetForm(): void {
    this.selectedCoffee = null;
    this.quantity = 1;
    this.customerName = '';
    setTimeout(() => {
      this.orderPlaced = false;
    }, 3000);
  }

  getTotalPrice(): number {
    return this.selectedCoffee ? this.selectedCoffee.price * this.quantity : 0;
  }
}
