// Quick test script to emit socket events
const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Test client connected:', socket.id);
  
  // Test order events
  setTimeout(() => {
    console.log('📦 Emitting order:created event...');
    socket.emit('order:created', {
      data: {
        orderId: 'test-order-' + Date.now(),
        orderNumber: 'ORD-' + Date.now(),
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        totalAmount: 1500,
        status: 'pending'
      }
    });
  }, 2000);

  // Test inventory low stock
  setTimeout(() => {
    console.log('⚠️ Emitting inventory:low-stock event...');
    socket.emit('inventory:low-stock', {
      data: {
        productId: 'prod-123',
        productName: 'LPG Cylinder 14.2kg',
        agencyId: 'agency-123',
        agencyName: 'Test Agency',
        stock: 3,
        lowStockThreshold: 10
      }
    });
  }, 4000);

  // Test notification
  setTimeout(() => {
    console.log('🔔 Emitting notification event...');
    socket.emit('notification', {
      data: {
        type: 'CUSTOM_NOTIFICATION',
        message: 'Test notification from server!',
        timestamp: new Date().toISOString()
      }
    });
  }, 6000);
});

socket.on('disconnect', () => {
  console.log('❌ Test client disconnected');
});

socket.on('connect_error', (error) => {
  console.error('🚨 Connection error:', error.message);
});

// Keep script running
setTimeout(() => {
  console.log('🔌 Disconnecting test client...');
  socket.disconnect();
  process.exit(0);
}, 10000);


