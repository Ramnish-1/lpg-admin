

import type { User, Product, Agent, Order, Payment, PaymentMethod } from './types';
import { products as sampleProducts, users as sampleUsers, agents as sampleAgents, orders as sampleOrders, paymentMethods as samplePaymentMethods, payments as samplePayments } from './sample-data';


// Mock data fetching functions
export async function getUsersData(): Promise<User[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleUsers;
}

export async function getProductsData(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleProducts;
}

export async function getAgentsData(): Promise<Agent[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleAgents;
}

export async function getOrdersData(): Promise<Order[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Enrich order data with customer and agent names
  return sampleOrders.map(order => {
    const customer = sampleUsers.find(u => u.id === order.customerId);
    // This logic needs to be updated or removed if switching to live API
    // The live API should return all necessary data
    return {
      ...order,
      customerName: customer?.name || 'Unknown Customer',
      customerPhone: customer?.phone || 'N/A',
    } as any;
  });
}

export async function getPaymentsData(): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return samplePayments;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return samplePaymentMethods;
}


// --- Single item getters ---
export async function getOrderById(orderId: string): Promise<Order | undefined> {
    const orders = await getOrdersData();
    const order = orders.find(o => o.id === orderId);
    if (!order) return undefined;

    // This logic needs to be updated or removed if switching to live API
    const customer = await getUserById(order.customerId as unknown as string);
    const agent = order.assignedAgent ? await getAgentById(order.assignedAgent.id) : undefined;
    
    return {
        ...order,
        // @ts-ignore
        customer,
        // @ts-ignore
        agent,
    }
}

export async function getUserById(userId: string): Promise<User | undefined> {
    const users = await getUsersData();
    return users.find(u => u.id === userId);
}

export async function getAgentById(agentId: string): Promise<Agent | undefined> {
    const agents = await getAgentsData();
    return agents.find(a => a.id === agentId);
}

    