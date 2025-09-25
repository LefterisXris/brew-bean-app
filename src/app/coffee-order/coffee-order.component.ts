import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoffeeService } from '../coffee.service';
import { Coffee, Order, BasketItem, PaymentMethod, PaymentInfo } from '../models/coffee.model';
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
  selectedPaymentMethod: PaymentMethod = 'cash';
  isProcessingPayment: boolean = false;
  paymentMessage: string = '';
  private basketSubscription: Subscription = new Subscription();

  paymentOptions = [
    { value: 'cash' as PaymentMethod, label: 'Cash', icon: '💵' },
    { value: 'credit-card' as PaymentMethod, label: 'Credit Card', icon: '💳' },
    { value: 'google-pay' as PaymentMethod, label: 'Google Pay', icon: '📱' },
    { value: 'apple-pay' as PaymentMethod, label: 'Apple Pay', icon: '📲' }
  ];

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
    if (this.basket.length === 0 || !this.customerName.trim() || this.isProcessingPayment) {
      return;
    }

    this.isProcessingPayment = true;
    this.paymentMessage = '';

    // Start payment processing
    this.processPayment().then((paymentInfo) => {
      const order: Omit<Order, 'id'> = {
        items: [...this.basket],
        totalPrice: this.coffeeService.getBasketTotal(),
        orderDate: new Date().toISOString(),
        customerName: this.customerName.trim(),
        paymentInfo: paymentInfo
      };

      this.coffeeService.placeOrder(order).subscribe({
        next: (placedOrder) => {
          console.log('Order placed:', placedOrder);
          this.orderPlaced = true;
          this.paymentMessage = `✅ Payment successful via ${this.getPaymentMethodLabel(this.selectedPaymentMethod)}!`;
          this.coffeeService.clearBasket();
          this.resetForm();
          this.isProcessingPayment = false;
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.paymentMessage = '❌ Order failed. Please try again.';
          this.isProcessingPayment = false;
        }
      });
    }).catch((error) => {
      console.error('Payment failed:', error);
      this.paymentMessage = '❌ Payment failed. Please try again.';
      this.isProcessingPayment = false;
    });
  }

  private async processPayment(): Promise<PaymentInfo> {
    // Mock payment processing with different delays and success rates
    const paymentDelays = {
      'cash': 500,
      'credit-card': 2000,
      'google-pay': 1500,
      'apple-pay': 1200
    };

    const delay = paymentDelays[this.selectedPaymentMethod];

    // Update payment message during processing
    this.paymentMessage = `Processing ${this.getPaymentMethodLabel(this.selectedPaymentMethod)} payment...`;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, delay));

    // Mock 95% success rate (5% failure for realism)
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      throw new Error('Payment processing failed');
    }

    // Generate mock transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return {
      method: this.selectedPaymentMethod,
      status: 'completed',
      transactionId: transactionId
    };
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const option = this.paymentOptions.find(opt => opt.value === method);
    return option ? option.label : method;
  }

  resetForm(): void {
    this.selectedCoffee = null;
    this.quantity = 1;
    this.customerName = '';
    this.selectedPaymentMethod = 'cash';
    setTimeout(() => {
      this.orderPlaced = false;
      this.paymentMessage = '';
    }, 5000);
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
