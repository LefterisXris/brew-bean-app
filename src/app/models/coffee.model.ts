export interface Coffee {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface BasketItem {
  coffee: Coffee;
  quantity: number;
}

export type PaymentMethod = 'cash' | 'credit-card' | 'google-pay' | 'apple-pay';

export interface PaymentInfo {
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
}

export interface Order {
  id: number;
  items: BasketItem[];
  totalPrice: number;
  orderDate: string;
  customerName: string;
  paymentInfo?: PaymentInfo;
}

// Legacy order interface for backward compatibility
export interface LegacyOrder {
  id: number;
  coffee: Coffee;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  customerName: string;
}