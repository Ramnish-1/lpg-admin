// Simple Socket.IO Test Server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS setup
app.use(cors({
  origin: "http://localhost:3000", // Next.js app URL
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket connection handler
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Handle authentication
  socket.on('authenticate', (data) => {
    console.log('🔐 User authenticated:', data);
    socket.emit('authenticated', { success: true });
  });

  // Handle subscriptions
  socket.on('subscribe-orders', () => {
    socket.join('orders');
    console.log('📦 User subscribed to orders');
  });

  socket.on('subscribe-products', () => {
    socket.join('products');
    console.log('🛍️ User subscribed to products');
  });

  socket.on('subscribe-agencies', () => {
    socket.join('agencies');
    console.log('🏢 User subscribed to agencies');
  });

  socket.on('subscribe-inventory', (agencyId) => {
    socket.join(`inventory-${agencyId}`);
    console.log('📊 User subscribed to inventory:', agencyId);
  });

  // Test event handlers
  socket.on('test-order', (data) => {
    console.log('📦 Test order event:', data);
    io.to('orders').emit('order:created', {
      data: {
        orderId: 'test-' + Date.now(),
        orderNumber: 'ORD-' + Date.now(),
        customerName: 'Test Customer',
        status: 'pending'
      }
    });
  });

  socket.on('test-product', (data) => {
    console.log('🛍️ Test product event:', data);
    io.to('products').emit('product:created', {
      data: {
        id: 'prod-' + Date.now(),
        productName: 'Test Product',
        category: 'Test Category'
      }
    });
  });

  socket.on('test-inventory', (data) => {
    console.log('📊 Test inventory event:', data);
    io.emit('inventory:low-stock', {
      data: {
        productId: 'prod-123',
        productName: 'Test Product',
        agencyId: 'agency-123',
        agencyName: 'Test Agency',
        stock: 5,
        lowStockThreshold: 10
      }
    });
  });

  socket.on('test-notification', (data) => {
    console.log('🔔 Test notification event:', data);
    socket.emit('notification', {
      data: {
        type: 'CUSTOM_NOTIFICATION',
        message: 'This is a test notification from server!',
        timestamp: new Date().toISOString()
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO Test Server running on http://localhost:${PORT}`);
  console.log('📡 Ready to accept connections from Next.js app');
});

// Test API endpoints
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.IO Test Server is running!',
    port: PORT,
    time: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working!',
    socketConnections: io.engine.clientsCount
  });
});


