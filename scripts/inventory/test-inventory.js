/**
 * Test script for Inventory Management System
 * 
 * This script tests the key functionality of the inventory management system.
 * Run with: node scripts/inventory/test-inventory.js
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const AUTH_COOKIE = process.env.AUTH_COOKIE || ''

console.log('🧪 Inventory Management System - Test Suite\n')

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(AUTH_COOKIE && { 'Cookie': AUTH_COOKIE }),
    ...options.headers
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json().catch(() => ({}))
    
    return {
      ok: response.ok,
      status: response.status,
      data
    }
  } catch (error) {
    console.error(`❌ Error calling ${endpoint}:`, error.message)
    return {
      ok: false,
      status: 0,
      error: error.message
    }
  }
}

async function testGetInventory() {
  console.log('📋 Test 1: GET /api/curator/inventory')
  const result = await apiCall('/api/curator/inventory')
  
  if (result.ok) {
    console.log(`✅ Success: Found ${result.data.data?.variants?.length || 0} variants`)
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
  }
  console.log()
}

async function testCreateVariants() {
  console.log('📋 Test 2: POST /api/curator/inventory (Create variants)')
  
  const testData = {
    productId: 'test-product-id',
    variants: [
      { size: 'M', color: 'Red', stockQuantity: 10 },
      { size: 'L', color: 'Blue', stockQuantity: 15 }
    ]
  }
  
  const result = await apiCall('/api/curator/inventory', {
    method: 'POST',
    body: JSON.stringify(testData)
  })
  
  if (result.ok) {
    console.log(`✅ Success: Created ${result.data.data?.variants?.length || 0} variants`)
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
  }
  console.log()
}

async function testUpdateVariant() {
  console.log('📋 Test 3: PUT /api/curator/inventory/[id] (Update variant)')
  
  const testVariantId = 'test-variant-id'
  const testData = {
    stockQuantity: 25,
    sku: 'TEST-SKU-001'
  }
  
  const result = await apiCall(`/api/curator/inventory/${testVariantId}`, {
    method: 'PUT',
    body: JSON.stringify(testData)
  })
  
  if (result.ok) {
    console.log('✅ Success: Variant updated')
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
  }
  console.log()
}

async function testDownloadCSV() {
  console.log('📋 Test 4: GET /api/curator/inventory/csv (Download CSV)')
  
  const result = await apiCall('/api/curator/inventory/csv')
  
  if (result.ok) {
    console.log('✅ Success: CSV download endpoint accessible')
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
  }
  console.log()
}

async function testCSVTemplate() {
  console.log('📋 Test 5: GET /api/curator/inventory/csv/template (Download template)')
  
  const result = await apiCall('/api/curator/inventory/csv/template')
  
  if (result.ok) {
    console.log('✅ Success: CSV template endpoint accessible')
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
  }
  console.log()
}

async function testUploadCSV() {
  console.log('📋 Test 6: POST /api/curator/inventory/csv (Upload CSV)')
  
  const csvData = `productSlug,size,color,stock,sku
test-product,S,Red,10,SKU-001
test-product,M,Blue,15,SKU-002`
  
  const result = await apiCall('/api/curator/inventory/csv', {
    method: 'POST',
    body: JSON.stringify({ csvData })
  })
  
  if (result.ok) {
    console.log('✅ Success: CSV upload processed')
    if (result.data.summary) {
      console.log(`   Created: ${result.data.summary.created}`)
      console.log(`   Updated: ${result.data.summary.updated}`)
    }
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
    if (result.data.errors) {
      console.log('   Errors:', result.data.errors)
    }
  }
  console.log()
}

async function testGetProductVariants() {
  console.log('📋 Test 7: GET /api/products/[slug]/variants (Get product variants)')
  
  const testSlug = 'test-product-slug'
  const result = await apiCall(`/api/products/${testSlug}/variants`)
  
  if (result.ok) {
    console.log(`✅ Success: Found ${result.data.variants?.length || 0} variants`)
  } else {
    console.log(`❌ Failed: ${result.status} - ${result.data.error || 'Unknown error'}`)
  }
  console.log()
}

async function runTests() {
  console.log('Starting tests...\n')
  console.log('Note: Some tests may fail if you are not authenticated or')
  console.log('if test data does not exist. This is expected.\n')
  console.log('='.repeat(60))
  console.log()
  
  await testGetInventory()
  await testCreateVariants()
  await testUpdateVariant()
  await testDownloadCSV()
  await testCSVTemplate()
  await testUploadCSV()
  await testGetProductVariants()
  
  console.log('='.repeat(60))
  console.log('\n✨ Test suite complete!\n')
  console.log('To run with authentication, set AUTH_COOKIE environment variable:')
  console.log('AUTH_COOKIE="your-session-cookie" node scripts/inventory/test-inventory.js\n')
}

// Run tests
runTests().catch(console.error)
