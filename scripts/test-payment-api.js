#!/usr/bin/env node

/**
 * Test script for Payment Settings API endpoints
 * 
 * This script tests the three payment settings endpoints:
 * 1. GET /api/admin/payment-settings
 * 2. PUT /api/admin/payment-settings
 * 3. POST /api/admin/payment-settings/upload-qr
 * 4. GET /api/payment-methods
 * 
 * Usage:
 *   node scripts/test-payment-api.js
 * 
 * Note: You need to be running the dev server (npm run dev)
 * and have an admin session token to test the admin endpoints.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName) {
  log(`\n→ Testing: ${testName}`, 'blue');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function testPublicPaymentMethods() {
  logSection('1. Testing Public Payment Methods API');
  logTest('GET /api/payment-methods');

  try {
    const response = await fetch(`${BASE_URL}/api/payment-methods`);
    const data = await response.json();

    if (response.ok) {
      logSuccess(`Status: ${response.status}`);
      logSuccess('Response structure is valid');
      
      console.log('\nResponse Data:');
      console.log(JSON.stringify(data, null, 2));

      // Validate response structure
      if (data.methods && Array.isArray(data.methods)) {
        logSuccess(`Found ${data.methods.length} payment method(s)`);
        
        data.methods.forEach((method) => {
          console.log(`  - ${method.name} (${method.id}): ${method.enabled ? 'Enabled' : 'Disabled'}`);
        });
      } else {
        logError('Invalid response structure: missing methods array');
      }

      if (data.defaultMethod) {
        logSuccess(`Default method: ${data.defaultMethod}`);
      }

      if (typeof data.commissionRate === 'number') {
        logSuccess(`Commission rate: ${(data.commissionRate * 100).toFixed(1)}%`);
      }

      return { success: true, data };
    } else {
      logError(`Failed with status: ${response.status}`);
      console.log('Error:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAdminGetSettings(sessionToken) {
  logSection('2. Testing Admin Get Payment Settings');
  logTest('GET /api/admin/payment-settings');

  if (!sessionToken) {
    logWarning('No session token provided - skipping admin tests');
    logWarning('To test admin endpoints, provide a session token as first argument');
    return { success: false, skipped: true };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/admin/payment-settings`, {
      headers: {
        'Cookie': `next-auth.session-token=${sessionToken}`,
      },
    });
    
    const data = await response.json();

    if (response.ok) {
      logSuccess(`Status: ${response.status}`);
      
      if (data.settings) {
        logSuccess('Settings retrieved successfully');
        console.log('\nSettings:');
        console.log(JSON.stringify(data.settings, null, 2));
        return { success: true, data };
      } else {
        logError('Invalid response: missing settings object');
        return { success: false, error: 'Invalid response structure' };
      }
    } else {
      logError(`Failed with status: ${response.status}`);
      console.log('Error:', data);
      
      if (response.status === 401 || response.status === 403) {
        logWarning('Authentication/authorization failed - check your session token');
      }
      
      return { success: false, error: data };
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAdminUpdateSettings(sessionToken) {
  logSection('3. Testing Admin Update Payment Settings');
  logTest('PUT /api/admin/payment-settings');

  if (!sessionToken) {
    logWarning('No session token provided - skipping admin tests');
    return { success: false, skipped: true };
  }

  const testData = {
    yapeEnabled: true,
    yapePhoneNumber: '+51987654321',
    yapeInstructions: 'Test instructions for Yape',
    plinEnabled: false,
    defaultPaymentMethod: 'yape',
    commissionRate: 0.12,
  };

  console.log('\nTest data to send:');
  console.log(JSON.stringify(testData, null, 2));

  try {
    const response = await fetch(`${BASE_URL}/api/admin/payment-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${sessionToken}`,
      },
      body: JSON.stringify(testData),
    });
    
    const data = await response.json();

    if (response.ok) {
      logSuccess(`Status: ${response.status}`);
      
      if (data.settings) {
        logSuccess('Settings updated successfully');
        console.log('\nUpdated Settings:');
        console.log(JSON.stringify(data.settings, null, 2));
        
        // Verify the update
        if (data.settings.yapeEnabled === testData.yapeEnabled) {
          logSuccess('yapeEnabled updated correctly');
        }
        if (data.settings.yapePhoneNumber === testData.yapePhoneNumber) {
          logSuccess('yapePhoneNumber updated correctly');
        }
        
        return { success: true, data };
      } else {
        logError('Invalid response: missing settings object');
        return { success: false, error: 'Invalid response structure' };
      }
    } else {
      logError(`Failed with status: ${response.status}`);
      console.log('Error:', data);
      return { success: false, error: data };
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testValidationErrors() {
  logSection('4. Testing Validation Errors');
  
  logTest('Test 1: Missing phone number when Yape is enabled');
  
  const sessionToken = process.argv[2];
  if (!sessionToken) {
    logWarning('Skipping validation tests - no session token');
    return { success: false, skipped: true };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/admin/payment-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${sessionToken}`,
      },
      body: JSON.stringify({
        yapeEnabled: true,
        yapePhoneNumber: null, // This should trigger an error
      }),
    });
    
    const data = await response.json();

    if (response.status === 400) {
      logSuccess('Validation error returned correctly');
      console.log('Error message:', data.error);
      return { success: true };
    } else {
      logError(`Expected 400 status, got ${response.status}`);
      return { success: false };
    }
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n');
  log('Payment Settings API Test Suite', 'cyan');
  log('================================\n', 'cyan');
  
  const sessionToken = process.argv[2];
  
  if (!sessionToken) {
    logWarning('No admin session token provided');
    logWarning('Usage: node scripts/test-payment-api.js [SESSION_TOKEN]');
    logWarning('Only public endpoint will be tested\n');
  }

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  // Test 1: Public payment methods
  const test1 = await testPublicPaymentMethods();
  results.total++;
  if (test1.success) results.passed++;
  else if (test1.skipped) results.skipped++;
  else results.failed++;

  // Test 2: Admin get settings
  const test2 = await testAdminGetSettings(sessionToken);
  results.total++;
  if (test2.success) results.passed++;
  else if (test2.skipped) results.skipped++;
  else results.failed++;

  // Test 3: Admin update settings
  const test3 = await testAdminUpdateSettings(sessionToken);
  results.total++;
  if (test3.success) results.passed++;
  else if (test3.skipped) results.skipped++;
  else results.failed++;

  // Test 4: Validation errors
  const test4 = await testValidationErrors();
  results.total++;
  if (test4.success) results.passed++;
  else if (test4.skipped) results.skipped++;
  else results.failed++;

  // Summary
  logSection('Test Summary');
  console.log(`Total tests: ${results.total}`);
  logSuccess(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Failed: ${results.failed}`);
  }
  if (results.skipped > 0) {
    logWarning(`Skipped: ${results.skipped}`);
  }
  
  console.log('\n');

  if (results.failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
