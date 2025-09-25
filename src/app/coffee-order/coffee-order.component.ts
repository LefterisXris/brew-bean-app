import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoffeeService } from '../coffee.service';
import { Coffee, Order, BasketItem } from '../models/coffee.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-coffee-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coffee-order.component.html',
  styleUrl: './coffee-order.component.css'
})
export class CoffeeOrderComponent implements OnInit, OnDestroy {
  coffees: Coffee[] = [];
  selectedCoffee: Coffee | null = null;
  quantity: number = 1;
  customerName: string = '';
  orderPlaced: boolean = false;
  basket: BasketItem[] = [];
  itemAddedMessage: string = '';
  private basketSubscription: Subscription = new Subscription();

  constructor(private coffeeService: CoffeeService) {}

  ngOnInit(): void {
    this.loadCoffees();
    this.basketSubscription = this.coffeeService.basket$.subscribe(basket => {
      this.basket = basket;
    });
  }

  ngOnDestroy(): void {
    this.basketSubscription.unsubscribe();
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

  addToBasket(): void {
    if (!this.selectedCoffee || this.quantity <= 0) {
      return;
    }

    this.coffeeService.addToBasket(this.selectedCoffee, this.quantity);
    this.itemAddedMessage = `${this.quantity}x ${this.selectedCoffee.name} added to basket!`;

    // Reset selection
    this.selectedCoffee = null;
    this.quantity = 1;

    // Clear message after 2 seconds
    setTimeout(() => {
      this.itemAddedMessage = '';
    }, 2000);
  }

  updateBasketQuantity(coffeeId: number, quantity: number): void {
    this.coffeeService.updateBasketItem(coffeeId, quantity);
  }

  removeFromBasket(coffeeId: number): void {
    this.coffeeService.removeFromBasket(coffeeId);
  }

  placeOrder(): void {
    if (this.basket.length === 0 || !this.customerName.trim()) {
      return;
    }

    const order: Omit<Order, 'id'> = {
      items: [...this.basket],
      totalPrice: this.coffeeService.getBasketTotal(),
      orderDate: new Date().toISOString(),
      customerName: this.customerName.trim()
    };

    this.coffeeService.placeOrder(order).subscribe({
      next: (placedOrder) => {
        console.log('Order placed:', placedOrder);
        this.orderPlaced = true;
        this.coffeeService.clearBasket();
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

  getBasketTotal(): number {
    return this.coffeeService.getBasketTotal();
  }

  getBasketItemCount(): number {
    return this.coffeeService.getBasketItemCount();
  }
}
