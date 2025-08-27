
import type { User, Product, Agent, Order, Payment } from './types';

// Dummy Data
const users: User[] = [
  { id: 'usr_1', name: 'Arjun Kumar', email: 'arjun@example.com', phone: '9876543210', address: '123, MG Road, Bangalore, Karnataka 560001', status: 'Active', orderHistory: ['ord_1', 'ord_3'], createdAt: new Date('2023-01-15'), location: { lat: 12.9716, lng: 77.5946 } },
  { id: 'usr_2', name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', address: '456, Park Street, Kolkata, West Bengal 700016', status: 'Active', orderHistory: ['ord_2'], createdAt: new Date('2023-02-20'), location: { lat: 22.551, lng: 88.3578 } },
  { id: 'usr_3', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9876543212', address: '789, Juhu Beach, Mumbai, Maharashtra 400049', status: 'Blocked', orderHistory: [], createdAt: new Date('2023-03-10'), location: { lat: 19.088, lng: 72.8265 } },
];

const products: Product[] = [
    { id: 'prod_1', name: 'LPG Cylinder 14.2kg', description: 'Standard domestic cylinder', price: 1100, stock: 150, lowStockThreshold: 20, status: 'Active', history: [
        { date: new Date('2023-04-10'), type: 'price_change', oldValue: 1050, newValue: 1100 },
        { date: new Date('2023-05-15'), type: 'stock_update', oldValue: 200, newValue: 150 },
    ] },
    { id: 'prod_2', name: 'LPG Cylinder 5kg', description: 'Small portable cylinder', price: 450, stock: 8, lowStockThreshold: 10, status: 'Active', history: [
        { date: new Date('2023-03-20'), type: 'price_change', oldValue: 440, newValue: 450 },
    ] },
    { id: 'prod_3', name: 'LPG Pipe', description: 'High-quality safety hose', price: 200, stock: 80, lowStockThreshold: 15, status: 'Inactive' },
];

const agents: Agent[] = [
  { 
    id: 'agt_1', 
    name: 'Suresh Singh', 
    phone: '8765432109',
    email: 'suresh@example.com',
    vehicleDetails: 'KA-01-AB-1234',
    panCard: 'ABCDE1234F',
    aadharCard: '1234 5678 9012',
    drivingLicense: 'DL1420110012345',
    accountDetails: 'SBI - 1234567890',
    status: 'Online', 
    createdAt: new Date('2023-01-05'),
    currentLocation: { lat: 12.973, lng: 77.61 }, // Near MG Road, Bangalore
    report: {
      totalDeliveries: 124,
      totalEarnings: 31000,
      onTimeRate: 98,
      monthlyDeliveries: [
        { month: 'Jan', deliveries: 20 },
        { month: 'Feb', deliveries: 25 },
        { month: 'Mar', deliveries: 30 },
        { month: 'Apr', deliveries: 28 },
        { month: 'May', deliveries: 21 },
      ]
    }
  },
  { 
    id: 'agt_2', 
    name: 'Deepak Verma', 
    phone: '8765432108',
    email: 'deepak@example.com',
    vehicleDetails: 'MH-02-CD-5678', 
    panCard: 'FGHIJ5678K',
    aadharCard: '9876 5432 1098',
    drivingLicense: 'MH0220120012345',
    accountDetails: 'HDFC - 0987654321',
    status: 'Offline', 
    createdAt: new Date('2023-02-01'),
    currentLocation: { lat: 19.07, lng: 72.87 }, // Near Bandra, Mumbai
    report: {
      totalDeliveries: 95,
      totalEarnings: 23750,
      onTimeRate: 92,
       monthlyDeliveries: [
        { month: 'Jan', deliveries: 15 },
        { month: 'Feb', deliveries: 18 },
        { month: 'Mar', deliveries: 22 },
        { month: 'Apr', deliveries: 20 },
        { month: 'May', deliveries: 20 },
      ]
    }
  },
];

const baseOrders: Omit<Order, 'customerName' | 'agentName' | 'agentPhone' | 'customerPhone'>[] = [
  { id: 'ord_1', customerId: 'usr_1', products: [{ productId: 'prod_1', name: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1100, status: 'Delivered', assignedAgentId: 'agt_1', createdAt: new Date('2024-05-20'), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_2', customerId: 'usr_2', products: [{ productId: 'prod_2', name: 'LPG Cylinder 5kg', quantity: 1 }, { productId: 'prod_3', name: 'LPG Pipe', quantity: 1 }], totalAmount: 650, status: 'In-progress', assignedAgentId: 'agt_1', createdAt: new Date(), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_3', customerId: 'usr_1', products: [{ productId: 'prod_1', name: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1100, status: 'Pending', assignedAgentId: null, createdAt: new Date(new Date().setDate(new Date().getDate() - 1)), deliveryType: 'Pickup', paymentType: 'COD' },
  { id: 'ord_4', customerId: 'usr_2', products: [{ productId: 'prod_1', name: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1100, status: 'Cancelled', assignedAgentId: null, createdAt: new Date(new Date().setDate(new Date().getDate() - 2)), deliveryType: 'Home Delivery', paymentType: 'COD', reason: 'Customer request' },
];

const enrichOrders = (ordersToEnrich: any[]): Order[] => {
  return ordersToEnrich.map(order => {
    const customer = users.find(u => u.id === order.customerId);
    const agent = agents.find(a => a.id === order.assignedAgentId);
    return {
      ...order,
      customerName: customer?.name || 'Unknown Customer',
      customerPhone: customer?.phone,
      agentName: agent?.name,
      agentPhone: agent?.phone,
    };
  });
};

let orders: Order[] = enrichOrders(baseOrders);


const payments: Payment[] = [
  { id: 'pay_1', orderId: 'ord_1', amount: 1100, status: 'Success', type: 'COD', timestamp: new Date('2024-05-20') },
  { id: 'pay_2', orderId: 'ord_2', amount: 650, status: 'Pending', type: 'COD', timestamp: new Date() },
  { id: 'pay_3', orderId: 'ord_3', amount: 1100, status: 'Pending', type: 'COD', timestamp: new Date(new Date().setDate(new Date().getDate() - 1)) },
];

// Data Access Functions (simulating API calls)

// Dashboard
export async function getDashboardData() {
  const totalUsers = users.length;
  const totalOrders = orders.length;
  const activeAgents = agents.filter(a => a.status === 'Online').length;
  const totalAgents = agents.length;
  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, order) => sum + order.totalAmount, 0);

  const today = new Date();
  const ordersByDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      orders: 0
    };
  }).reverse();

  orders.forEach(order => {
    const orderDate = new Date(order.createdAt);
    const diffDays = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 7) {
      const dayIndex = 6 - diffDays;
      if (ordersByDay[dayIndex]) {
        ordersByDay[dayIndex].orders++;
      }
    }
  });

  return {
    stats: { totalUsers, totalOrders, activeAgents, totalAgents, totalRevenue },
    ordersByDay,
  };
}

export async function getRecentOrders() {
  const enriched = enrichOrders(orders);
  return enriched.slice(0, 5);
}

// Users
export async function getUsersData(): Promise<User[]> { return users; }

// Orders
export async function getOrdersData(): Promise<Order[]> {
  // Re-enrich every time in case underlying data (users, agents) changes.
  orders = enrichOrders(baseOrders);
  return orders;
}

export async function getOrderById(orderId: string) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const customer = users.find(u => u.id === order.customerId);
    const agent = agents.find(a => a.id === order.assignedAgentId);

    return {
        ...order,
        customer,
        agent,
    };
}


// Agents
export async function getAgentsData(): Promise<Agent[]> { return agents; }

// Products
export async function getProductsData(): Promise<Product[]> { return products; }

// Payments
export async function getPaymentsData(): Promise<Payment[]> { return payments; }

// This is a utility function to update localStorage, not an API call
export function updateLocalStorage(key: string, data: any) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
}
