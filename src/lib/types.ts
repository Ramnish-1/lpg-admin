

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely on a backend
  phone: string;
  address: string;
  status: 'Active' | 'Blocked';
  orderHistory: string[];
  createdAt: Date;
  location: { lat: number; lng: number };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  status: 'Active' | 'Inactive';
  lowStockThreshold: number;
  history?: { date: Date; type: 'price_change' | 'stock_update', oldValue: number, newValue: number }[];
}

export interface AgentReport {
    totalDeliveries: number;
    totalEarnings: number;
    onTimeRate: number;
    monthlyDeliveries: { month: string; deliveries: number }[];
}


export interface Agent {
  id:string;
  name: string;
  phone: string;
  email: string;
  vehicleDetails: string;
  panCard: string;
  aadharCard: string;
  drivingLicense: string;
  accountDetails: string;
  status: 'Online' | 'Offline';
  createdAt: Date;
  report: AgentReport;
  currentLocation: { lat: number; lng: number };
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  products: { productId: string; name: string; quantity: number }[];
  totalAmount: number;
  status: 'Pending' | 'In-progress' | 'Delivered' | 'Cancelled' | 'Returned';
  assignedAgentId: string | null;
  agentName?: string;
  agentPhone?: string;
  createdAt: Date;
  deliveryType: 'Home Delivery' | 'Pickup';
  paymentType: 'COD';
  cancellationReason?: string;
  returnReason?: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    config: Record<string, any>; // For API keys, etc.
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'Pending' | 'Success' | 'Refunded';
  method: string; // e.g., 'Cash on Delivery', 'UPI'
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
