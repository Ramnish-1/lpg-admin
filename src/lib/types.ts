

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
  agencyId?: string;
  agencyStatus?: 'active' | 'inactive';
}

export interface ProductVariant {
  label: string; // e.g., '14.2kg', '5kg'
  value: number;
  unit: 'kg' | 'meter';
  price: number;
  stock: number;
}

export interface AgencyInventory {
  id: string;
  productId: string;
  agencyId: string;
  stock: number;
  lowStockThreshold: number;
  agencyPrice: number; // This might be deprecated if agencyVariants is used
  agencyVariants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  Product?: Product; 
  Agency?: Agency;
}


export interface Product {
  id: string;
  productName: string;
  description: string;
  category: 'lpg' | 'accessories';
  status: 'active' | 'inactive';
  lowStockThreshold: number; // This might be a global default
  variants: ProductVariant[]; // Global default variants
  images: string[]; // URLs to images
  createdAt: string;
  updatedAt: string;
  AgencyInventory?: AgencyInventory[]; // An array of inventory records for different agencies
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
  Agency?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    status: 'active' | 'inactive';
  };
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
  deliveryMode?: string;
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
  cancelledBy?: 'admin' | 'customer' | 'agency';
  cancelledById?: string;
  cancelledByName?: string;
  returnedAt?: string | null;
  returnedBy?: 'customer' | 'admin' | 'agency';
  returnedById?: string;
  returnedByName?: string;
  returnReason?: string;
  assignedAgent?: {
    id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
  } | null;
  agency?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    status: 'active' | 'inactive';
  }
  deliveryProofImage?: string;
  deliveryNote?: string;
  paymentReceived?: boolean;
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
  confirmationToken: string | null;
  confirmationExpiresAt: Date | null;
}

export interface ContentSection {
  title: string;
  description: string;
}

export interface TermsAndCondition {
    id: string;
    version: string;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    content: ContentSection[];
    createdAt: string;
    updatedAt: string;
}

export interface PrivacyPolicy {
    id: string;
    version: string;
    title: string;
    description: string;
    status: 'active' | 'inactive';
    content: ContentSection[];
    createdAt: string;
    updatedAt: string;
}
