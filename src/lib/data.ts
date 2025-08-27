
import type { User, Product, Agent, Order, Payment } from './types';

// Dummy Data
const users: User[] = [
  { id: 'usr_1', name: 'Arjun Kumar', email: 'arjun@example.com', phone: '9876543210', address: '123, MG Road, Bangalore', status: 'Active', orderHistory: ['ord_1', 'ord_3'], createdAt: new Date('2023-01-15') },
  { id: 'usr_2', name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', address: '456, Park Street, Kolkata', status: 'Active', orderHistory: ['ord_2'], createdAt: new Date('2023-02-20') },
  { id: 'usr_3', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9876543212', address: '789, Juhu Beach, Mumbai', status: 'Blocked', orderHistory: [], createdAt: new Date('2023-03-10') },
];

const products: Product[] = [
  { id: 'prod_1', name: 'LPG Cylinder 14.2kg', description: 'Standard domestic cylinder', price: 1100, stock: 150, lowStockThreshold: 20 },
  { id: 'prod_2', name: 'LPG Cylinder 5kg', description: 'Small portable cylinder', price: 450, stock: 15, lowStockThreshold: 10 },
  { id: 'prod_3', name: 'LPG Pipe', description: 'High-quality safety hose', price: 200, stock: 80, lowStockThreshold: 15 },
];

const agents: Agent[] = [
  { id: 'agt_1', name: 'Suresh Singh', phone: '8765432109', vehicleDetails: 'KA-01-AB-1234', status: 'Online', createdAt: new Date('2023-01-05') },
  { id: 'agt_2', name: 'Deepak Verma', phone: '8765432108', vehicleDetails: 'MH-02-CD-5678', status: 'Offline', createdAt: new Date('2023-02-01') },
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

const orders: Order[] = enrichOrders(baseOrders);


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
  return orders.slice(0, 5);
}

// Users
export async function getUsersData() { return users; }

// Orders
export async function getOrdersData(): Promise<Order[]> {
  return orders;
}

// Agents
export async function getAgentsData() { return agents; }

// Products
export async function getProductsData() { return products; }

// Payments
export async function getPaymentsData() { return payments; }
