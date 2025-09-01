

import type { User, Product, Agent, Order, Payment, PaymentMethod } from './types';

// NOTE: This file now contains only the base data structures for reference.
// The application has been migrated to fetch all dynamic data from the API.

// Base data structures (for type reference)
const baseUsers: User[] = [
  { id: 'usr_1', name: 'Arjun Kumar', email: 'arjun@example.com', phone: '9876543210', address: '123, MG Road, Bangalore, Karnataka 560001', status: 'Active', orderHistory: ['ord_1', 'ord_3'], createdAt: new Date('2023-01-15'), location: { lat: 12.9716, lng: 77.5946 } },
];

const baseProducts: Product[] = [
    { id: 'prod_1', productName: 'LPG Cylinder', description: 'Standard domestic cylinder', lowStockThreshold: 20, status: 'Active', variants: [], images: [] },
];

const baseAgents: Agent[] = [
  { 
    id: 'agt_1', 
    name: 'Suresh Singh', 
    phone: '8765432109',
    email: 'suresh@example.com',
    vehicleNumber: 'KA-01-AB-1234',
    panCardNumber: 'ABCDE1234F',
    aadharCardNumber: '1234 5678 9012',
    drivingLicence: 'DL1420110012345',
    bankDetails: 'SBI - 1234567890',
    status: 'Online', 
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05'),
    joinedAt: new Date('2023-01-05'),
  },
];

const baseOrders: Omit<Order, 'customerName' | 'agentName' | 'agentPhone' | 'customerPhone'>[] = [
  { id: 'ord_1', customerId: 'usr_1', products: [{ productId: 'prod_1', productName: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1100, status: 'Delivered', assignedAgentId: 'agt_1', createdAt: new Date('2024-05-20'), deliveryType: 'Home Delivery', paymentType: 'COD' },
];

const basePaymentMethods: PaymentMethod[] = [
    { id: 'pm_1', name: 'Cash on Delivery', description: 'Pay cash upon receiving the order.', status: 'Active', config: {} },
];

const basePayments: Payment[] = [
  { id: 'pay_1', orderId: 'ord_1', amount: 1100, status: 'Success', method: 'Cash on Delivery', timestamp: new Date('2024-05-20') },
];

// No data access functions are exported from this file anymore as all data is fetched from APIs.
