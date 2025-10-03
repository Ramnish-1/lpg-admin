// Simple script to set test auth token in browser
// Run this in browser console

console.log('🔑 Setting test auth token...');

// Set test token
localStorage.setItem('authToken', 'test-token-123');
localStorage.setItem('userRole', 'admin');
localStorage.setItem('userId', 'user-123');
localStorage.setItem('userName', 'Test User');

console.log('✅ Test token set!');
console.log('📝 Stored data:');
console.log('- authToken:', localStorage.getItem('authToken'));
console.log('- userRole:', localStorage.getItem('userRole'));
console.log('- userId:', localStorage.getItem('userId'));

console.log('🔄 Now refresh the page to auto-connect socket!');



