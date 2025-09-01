
import type { User, Product, Agent, Order, Payment, PaymentMethod } from './types';

// This file contains the sample data that was previously in data.ts.
// It is used by the mock data fetching functions in data.ts.

export const users: User[] = [
  { id: 'usr_1', name: 'Arjun Kumar', email: 'arjun@example.com', phone: '9876543210', address: '123, MG Road, Bangalore, Karnataka 560001', status: 'Active', orderHistory: ['ord_1', 'ord_3'], createdAt: new Date('2023-01-15'), location: { lat: 12.9716, lng: 77.5946 } },
  { id: 'usr_2', name: 'Priya Sharma', email: 'priya@example.com', phone: '9123456780', address: '456, Jubilee Hills, Hyderabad, Telangana 500033', status: 'Active', orderHistory: ['ord_2'], createdAt: new Date('2023-02-20'), location: { lat: 17.4065, lng: 78.4772 } },
  { id: 'usr_3', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '9988776655', address: '789, Altamount Road, Mumbai, Maharashtra 400026', status: 'Blocked', orderHistory: [], createdAt: new Date('2023-03-10'), location: { lat: 18.9632, lng: 72.8083 } },
  { id: 'usr_4', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9654321098', address: '101, Anna Salai, Chennai, Tamil Nadu 600002', status: 'Active', orderHistory: ['ord_4'], createdAt: new Date('2023-04-05'), location: { lat: 13.0827, lng: 80.2707 } },
  { id: 'usr_5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '9001234567', address: '21, Sardar Patel Marg, New Delhi, Delhi 110021', status: 'Active', orderHistory: ['ord_5'], createdAt: new Date('2023-05-01'), location: { lat: 28.6139, lng: 77.2090 } },
];

export const products: Product[] = [
  {
    id: 'prod_1',
    productName: 'LPG Cylinder',
    description: 'Standard 14.2kg domestic LPG cylinder for household use. Complies with all safety standards.',
    lowStockThreshold: 20,
    status: 'Active',
    images: ['https://picsum.photos/seed/gas-cylinder-1/400/400', 'https://picsum.photos/seed/gas-cylinder-2/400/400'],
    variants: [
      { label: '14.2kg Refill', price: 1105.50, stock: 150 },
      { label: '5kg Refill', price: 450.00, stock: 75 },
    ],
    history: [
      { date: new Date('2023-04-15'), type: 'price_change', oldValue: 1050, newValue: 1105.50 },
      { date: new Date('2023-05-01'), type: 'stock_update', oldValue: 200, newValue: 150 },
    ]
  },
  {
    id: 'prod_2',
    productName: 'Gas Stove - 2 Burner',
    description: 'A durable and efficient two-burner gas stove, perfect for small families. Features manual ignition and a toughened glass top.',
    lowStockThreshold: 10,
    status: 'Active',
    images: ['https://picsum.photos/seed/gas-stove-1/400/400', 'https://picsum.photos/seed/gas-stove-2/400/400'],
    variants: [
      { label: 'Steel Body', price: 2500, stock: 50 },
      { label: 'Glass Top', price: 3200, stock: 40 },
    ],
     history: []
  },
  {
    id: 'prod_3',
    productName: 'LPG Pipe and Regulator',
    description: 'A complete set including a 1.5m ISI-marked LPG hose and a high-quality brass regulator.',
    lowStockThreshold: 50,
    status: 'Active',
    images: ['https://picsum.photos/seed/gas-pipe/400/400'],
    variants: [
      { label: 'Standard Set', price: 850, stock: 200 },
    ],
     history: []
  },
];

export const agents: Agent[] = [
  { 
    id: 'agt_1', 
    name: 'Suresh Singh', 
    phone: '8765432109',
    email: 'suresh@example.com',
    vehicleNumber: 'KA-01-AB-1234',
    panCardNumber: 'ABCDE1234F',
    aadharCardNumber: '1234 5678 9012',
    drivingLicence: 'DL1420110012345',
    bankDetails: 'State Bank of India, A/C: 1234567890, IFSC: SBIN0001234',
    status: 'Online', 
    joinedAt: new Date('2023-01-05'),
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date(),
    currentLocation: { lat: 12.9750, lng: 77.6000 },
    report: {
        totalDeliveries: 152,
        totalEarnings: 30400,
        onTimeRate: 98,
        monthlyDeliveries: [
            { month: 'Jan', deliveries: 25 },
            { month: 'Feb', deliveries: 30 },
            { month: 'Mar', deliveries: 28 },
            { month: 'Apr', deliveries: 35 },
            { month: 'May', deliveries: 34 },
        ]
    }
  },
  { 
    id: 'agt_2', 
    name: 'Rajesh Sharma', 
    phone: '8899001122',
    email: 'rajesh@example.com',
    vehicleNumber: 'MH-12-CD-5678',
    panCardNumber: 'FGHIJ5678K',
    aadharCardNumber: '2345 6789 0123',
    drivingLicence: 'MH1220150067890',
    bankDetails: 'HDFC Bank, A/C: 9876543210, IFSC: HDFC0005678',
    status: 'Offline', 
    joinedAt: new Date('2023-02-10'),
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date(),
    currentLocation: { lat: 18.5204, lng: 73.8567 },
    report: {
        totalDeliveries: 120,
        totalEarnings: 24000,
        onTimeRate: 95,
        monthlyDeliveries: [
            { month: 'Jan', deliveries: 20 },
            { month: 'Feb', deliveries: 22 },
            { month: 'Mar', deliveries: 25 },
            { month: 'Apr', deliveries: 28 },
            { month: 'May', deliveries: 25 },
        ]
    }
  },
];

export const orders: Omit<Order, 'customerName' | 'agentName' | 'agentPhone' | 'customerPhone'>[] = [
  { id: 'ord_1', customerId: 'usr_1', products: [{ productId: 'prod_1', productName: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1105.50, status: 'Delivered', assignedAgentId: 'agt_1', createdAt: new Date('2024-05-20T10:30:00Z'), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_2', customerId: 'usr_2', products: [{ productId: 'prod_1', productName: 'LPG Cylinder 5kg', quantity: 1 }, { productId: 'prod_2', productName: 'Gas Stove - Glass Top', quantity: 1 }], totalAmount: 3650, status: 'In-progress', assignedAgentId: 'agt_1', createdAt: new Date('2024-05-22T11:00:00Z'), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_3', customerId: 'usr_1', products: [{ productId: 'prod_1', productName: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1105.50, status: 'Cancelled', cancellationReason: 'Customer requested cancellation', assignedAgentId: null, createdAt: new Date('2024-05-21T09:00:00Z'), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_4', customerId: 'usr_4', products: [{ productId: 'prod_3', productName: 'LPG Pipe and Regulator', quantity: 1 }], totalAmount: 850, status: 'Pending', assignedAgentId: null, createdAt: new Date('2024-05-23T14:00:00Z'), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_5', customerId: 'usr_5', products: [{ productId: 'prod_1', productName: 'LPG Cylinder 14.2kg', quantity: 2 }], totalAmount: 2211, status: 'Pending', assignedAgentId: null, createdAt: new Date('2024-05-23T16:30:00Z'), deliveryType: 'Home Delivery', paymentType: 'COD' },
  { id: 'ord_6', customerId: 'usr_2', products: [{ productId: 'prod_1', productName: 'LPG Cylinder 14.2kg', quantity: 1 }], totalAmount: 1105.50, status: 'Delivered', assignedAgentId: 'agt_2', createdAt: new Date('2024-05-18T12:00:00Z'), deliveryType: 'Home Delivery', paymentType: 'COD', returnReason: 'Gas leak reported' },
];


export const paymentMethods: PaymentMethod[] = [
    { id: 'pm_1', name: 'Cash on Delivery', description: 'Pay cash upon receiving the order.', status: 'Active', config: {} },
    { id: 'pm_2', name: 'UPI', description: 'Pay instantly using any UPI app.', status: 'Active', config: { merchantId: '123456789', merchantCode: 'gastrack' } },
    { id: 'pm_3', name: 'Credit/Debit Card', description: 'Pay using Visa, MasterCard, or RuPay.', status: 'Inactive', config: { gateway: 'Razorpay', apiKey: 'rzp_test_12345' } },
];

export const payments: Payment[] = [
  { id: 'pay_1', orderId: 'ord_1', amount: 1105.50, status: 'Success', method: 'Cash on Delivery', timestamp: new Date('2024-05-20T11:00:00Z') },
  { id: 'pay_2', orderId: 'ord_2', amount: 3650, status: 'Pending', method: 'UPI', timestamp: new Date('2024-05-22T11:05:00Z') },
  { id: 'pay_3', orderId: 'ord_3', amount: 1105.50, status: 'Refunded', method: 'COD', timestamp: new Date('2024-05-21T09:10:00Z') },
  { id: 'pay_4', orderId: 'ord_6', amount: 1105.50, status: 'Success', method: 'Card', timestamp: new Date('2024-05-18T12:30:00Z') },
];
