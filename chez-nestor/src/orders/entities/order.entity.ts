export interface Order {
  id: number;
  pizzas: number[];
  drinks: number[];
  desserts: number[];
  totalPrice: number;
  processed: boolean;
  createdAt: Date;
}
