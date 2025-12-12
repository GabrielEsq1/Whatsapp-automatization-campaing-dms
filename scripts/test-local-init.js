const { initializeClient } = require('../lib/whatsappClient');

// Using the user ID found in DB
const userId = '8f6af92c-4d45-4d18-b204-f8ace61806b6';

console.log('Starting local init test...');
initializeClient(userId).catch(console.error);

// Keep alive
setInterval(() => { }, 1000);
