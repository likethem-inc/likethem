/**
 * Test script for Orders API
 * 
 * This script tests the POST /api/orders endpoint
 * Run with: node test-orders-api.js
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Test data
const testOrderPayload = {
  items: [
    {
      productId: 'test-product-id-1',
      quantity: 2,
      size: 'M',
      color: 'Blue',
      curatorId: 'test-curator-id-1'
    }
  ],
  shippingAddress: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    address: '123 Test Street',
    city: 'Test City',
    state: 'TC',
    zipCode: '12345',
    country: 'Test Country'
  },
  paymentMethod: 'stripe'
};

async function testCreateOrder() {
  console.log('🧪 Testing POST /api/orders');
  console.log('📦 Payload:', JSON.stringify(testOrderPayload, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrderPayload),
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed');
      console.error('Status:', response.status);
      console.error('Error:', data.error);
      return;
    }

    console.log('✅ Order created successfully!');
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    
    if (data.orders && Array.isArray(data.orders)) {
      console.log(`\n📊 Summary:`);
      console.log(`   - Orders created: ${data.orders.length}`);
      data.orders.forEach((order, index) => {
        console.log(`   - Order ${index + 1}:`);
        console.log(`     • ID: ${order.id}`);
        console.log(`     • Status: ${order.status}`);
        console.log(`     • Total: $${order.totalAmount.toFixed(2)}`);
        console.log(`     • Commission: $${order.commission.toFixed(2)}`);
        console.log(`     • Curator Amount: $${order.curatorAmount.toFixed(2)}`);
        console.log(`     • Items: ${order.items.length}`);
      });
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testGetOrders() {
  console.log('\n🧪 Testing GET /api/orders');
  
  try {
    const response = await fetch(`${BASE_URL}/api/orders?page=1&limit=5`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed');
      console.error('Status:', response.status);
      console.error('Error:', data.error);
      return;
    }

    console.log('✅ Orders fetched successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total orders: ${data.total}`);
    console.log(`   - Current page: ${data.page}/${data.pages}`);
    console.log(`   - Orders on page: ${data.orders.length}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors');
  
  const testCases = [
    {
      name: 'Empty items array',
      payload: { ...testOrderPayload, items: [] },
      expectedError: 'Cart items are required'
    },
    {
      name: 'Missing shipping address',
      payload: { ...testOrderPayload, shippingAddress: {} },
      expectedError: 'Complete shipping address is required'
    },
    {
      name: 'Invalid payment method',
      payload: { ...testOrderPayload, paymentMethod: 'invalid' },
      expectedError: 'Invalid payment method'
    },
    {
      name: 'Missing transaction code for yape',
      payload: { ...testOrderPayload, paymentMethod: 'yape' },
      expectedError: 'Transaction code is required'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n   Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.status === 400 && data.error) {
        console.log(`   ✅ Correct validation: ${data.error}`);
      } else {
        console.log(`   ⚠️  Unexpected response:`, data);
      }
    } catch (error) {
      console.error(`   ❌ Test failed:`, error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('═══════════════════════════════════════');
  console.log('🚀 Orders API Test Suite');
  console.log('═══════════════════════════════════════\n');
  
  console.log('⚠️  NOTE: These tests require:');
  console.log('   1. A running development server');
  console.log('   2. Valid authentication session');
  console.log('   3. Valid product IDs in test data\n');
  
  // Run validation tests (don't require auth)
  await testValidationErrors();
  
  console.log('\n═══════════════════════════════════════');
  console.log('📝 Manual Tests (require auth):');
  console.log('═══════════════════════════════════════\n');
  console.log('Run these manually with valid session:');
  console.log('1. testCreateOrder()');
  console.log('2. testGetOrders()');
  console.log('\n');
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCreateOrder,
    testGetOrders,
    testValidationErrors,
    runTests
  };
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}
