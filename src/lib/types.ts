

export interface UserAddress {
  id: string;
  city: string;
  title: string;
  address: string;
  pincode: string;
  landmark: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  address: string; // This will hold the primary formatted address string for table views
  addresses?: UserAddress[]; // This will hold the full address objects
  status: 'Active' | 'Blocked';
  isBlocked?: boolean;
  orderHistory: string[];
  createdAt: Date;
  location: { lat: number; lng: number };
  role?: string;
  profileImage?: string | null;
}

export interface ProductVariant {
  label: string; // e.g., '14.2kg', '5kg'
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  agency?: Agency;
  productName: string;
  description: string;
  category: 'lpg' | 'accessories';
  status: 'active' | 'inactive';
  lowStockThreshold: number;
  variants: ProductVariant[];
  images: string[]; // URLs to images
  createdAt?: string;
  updatedAt?: string;
  history?: { date: Date; type: 'price_change' | 'stock_update', oldValue: number, newValue: number }[];
  // Legacy fields that might exist on old data, but should not be sent to APIs
  unit?: any;
  price?: any;
  stock?: any;
}


export interface AgentReport {
    totalDeliveries: number;
    totalEarnings: number;
    onTimeRate: number;
    monthlyDeliveries: { month: string; deliveries: number }[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleNumber: string;
  panCardNumber: string;
  aadharCardNumber: string;
  drivingLicence: string;
  bankDetails: string;
  status: 'online' | 'offline';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  profileImage?: string;
  report?: AgentReport; 
  currentLocation?: { lat: number; lng: number };
}


export interface OrderItem {
  total: number;
  quantity: number;
  productId: string;
  productName: string;
  variantLabel: string;
  variantPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: string;
  totalAmount: string;
  totalRevenue?: number;
  paymentMethod: string;
  paymentStatus: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'out-for-delivery' | 'delivered' | 'cancelled' | 'returned' | 'assigned';
  adminNotes?: string | null;
  agentNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string | null;
  assignedAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  assignedAgent?: {
    id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
  } | null;
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

export interface Notification {
    id: string;
    message: string;
    orderId: string;
    timestamp: Date;
    read: boolean;
}

export interface Agency {
  id: string;
  name: string;
  email: string;
  phone: string;
  addressTitle: string;
  address: string;
  city: string;
  pincode: string;
  landmark: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
    

    
