/**
 * Socket Authentication Test Script
 * Run this in your browser console AFTER logging in
 */

console.log('🧪 Testing Socket Authentication...\n');

// Check localStorage
console.log('📦 LocalStorage Check:');
console.log('  ✓ gastrack-token:', localStorage.getItem('gastrack-token') ? '✅ Found' : '❌ Missing');
console.log('  ✓ authToken:', localStorage.getItem('authToken') ? '✅ Found' : '❌ Missing');
console.log('  ✓ userId:', localStorage.getItem('userId') || '❌ Missing');
console.log('  ✓ userRole:', localStorage.getItem('userRole') || '❌ Missing');
console.log('  ✓ agencyId:', localStorage.getItem('agencyId') || '❌ Not set (OK if not agency)');

console.log('\n');

// Check if tokens match
const gastrakToken = localStorage.getItem('gastrack-token');
const authToken = localStorage.getItem('authToken');

if (gastrakToken && authToken) {
  if (gastrakToken === authToken) {
    console.log('✅ Tokens Match! Both tokens are identical.');
  } else {
    console.log('⚠️ Warning: Tokens are different!');
    console.log('  gastrack-token:', gastrakToken.substring(0, 20) + '...');
    console.log('  authToken:', authToken.substring(0, 20) + '...');
  }
} else {
  console.log('❌ Missing one or both tokens!');
}

console.log('\n');

// Decode JWT token (basic, without verification)
if (authToken) {
  try {
    const base64Url = authToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    console.log('🔑 JWT Token Payload:');
    console.log('  User ID:', payload.userId);
    console.log('  Role:', payload.role);
    console.log('  Agency ID:', payload.agencyId || 'N/A');
    console.log('  Email:', payload.email || 'N/A');
    console.log('  Expires:', new Date(payload.exp * 1000).toLocaleString());
    
    // Check if token is expired
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      console.log('  ⚠️ Token is EXPIRED!');
    } else {
      console.log('  ✅ Token is valid');
    }
  } catch (error) {
    console.log('❌ Failed to decode JWT token:', error.message);
  }
} else {
  console.log('❌ No authToken found to decode');
}

console.log('\n');

// Check socket connection status
console.log('🔌 Socket Status:');
if (window.io && window.io.sockets && window.io.sockets.length > 0) {
  const socket = window.io.sockets[0];
  console.log('  Connected:', socket.connected ? '✅' : '❌');
  console.log('  Socket ID:', socket.id || 'N/A');
  console.log('  Auth:', socket.auth?.token ? '✅ Has token' : '❌ No token');
} else {
  console.log('  ℹ️ Socket object not directly accessible (this is normal with context)');
  console.log('  Check the main console for socket connection messages');
}

console.log('\n');
console.log('📋 Summary:');
console.log('  1. Check that all required data is in localStorage ✅');
console.log('  2. Verify tokens match ✅');
console.log('  3. Decode token to see user info ✅');
console.log('  4. Look for socket connection messages in console ✅');
console.log('\n');
console.log('✨ Expected console messages after login:');
console.log('  "🔍 Checking for auth token: Found"');
console.log('  "🔍 User role: [your-role]"');
console.log('  "🔄 Socket reconnected with auth token"');
console.log('  "✅ Socket Connected: [socket-id]"');
console.log('  "🔔 [Role] subscribed to [events]"');

