
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Blocked';
  orderHistory: string[];
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

export interface Agent {
  id:string;
  name: string;
  phone: string;
  vehicleDetails: string;
  status: 'Online' | 'Offline';
  createdAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  products: { productId: string; name: string; quantity: number }[];
  totalAmount: number;
  status: 'Pending' | 'In-progress' | 'Delivered' | 'Cancelled';
  assignedAgentId: string | null;
  agentName?: string;
  agentPhone?: string;
  createdAt: Date;
  deliveryType: 'Home Delivery' | 'Pickup';
  paymentType: 'COD';
  reason?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'Pending' | 'Success' | 'Refunded';
  type: 'COD';
  timestamp: Date;
}

export interface DayAvailability {
  available: boolean;
  startTime: string;
  endTime: string;
}

export interface Availability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}
