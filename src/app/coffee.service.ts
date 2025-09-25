import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Coffee, Order, BasketItem, LegacyOrder } from './models/coffee.model';

@Injectable({
  providedIn: 'root'
})
export class CoffeeService {
  private apiUrl = 'http://localhost:3000';
  private basketSubject = new BehaviorSubject<BasketItem[]>([]);
  public basket$ = this.basketSubject.asObservable();

  constructor(private http: HttpClient) { }

  getCoffees(): Observable<Coffee[]> {
    return this.http.get<Coffee[]>(`${this.apiUrl}/coffees`);
  }

  getOrders(): Observable<(Order | LegacyOrder)[]> {
    return this.http.get<(Order | LegacyOrder)[]>(`${this.apiUrl}/orders`);
  }

  placeOrder(order: Omit<Order, 'id'>): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  // Basket functionality
  getBasket(): BasketItem[] {
    return this.basketSubject.value;
  }

  addToBasket(coffee: Coffee, quantity: number = 1): void {
    const currentBasket = this.getBasket();
    const existingItem = currentBasket.find(item => item.coffee.id === coffee.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentBasket.push({ coffee, quantity });
    }

    this.basketSubject.next([...currentBasket]);
  }

  updateBasketItem(coffeeId: number, quantity: number): void {
    const currentBasket = this.getBasket();
    const item = currentBasket.find(item => item.coffee.id === coffeeId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromBasket(coffeeId);
      } else {
        item.quantity = quantity;
        this.basketSubject.next([...currentBasket]);
      }
    }
  }

  removeFromBasket(coffeeId: number): void {
    const currentBasket = this.getBasket();
    const filteredBasket = currentBasket.filter(item => item.coffee.id !== coffeeId);
    this.basketSubject.next(filteredBasket);
  }

  clearBasket(): void {
    this.basketSubject.next([]);
  }

  getBasketTotal(): number {
    return this.getBasket().reduce((total, item) => total + (item.coffee.price * item.quantity), 0);
  }

  getBasketItemCount(): number {
    return this.getBasket().reduce((total, item) => total + item.quantity, 0);
  }
}
