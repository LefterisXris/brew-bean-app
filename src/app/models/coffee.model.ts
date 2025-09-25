export interface Coffee {
  id: number;
  name: string;
  price: number;
  description: string;
}

export interface Order {
  id: number;
  coffee: Coffee;
  quantity: number;
  totalPrice: number;
  orderDate: string;
  customerName: string;
}