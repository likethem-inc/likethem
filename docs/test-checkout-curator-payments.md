# Test Plan: Curator-Specific Payment Methods in Checkout

## Quick Test Commands

### 1. Check if page compiles
```bash
npm run build
```

### 2. Start dev server
```bash
npm run dev
```

### 3. Test the flow manually

#### Test Case 1: Single Curator Cart
**Steps:**
1. Add products from ONE curator to cart
2. Navigate to `/checkout`
3. Expected: Payment methods load correctly
4. Expected: No multi-curator warning
5. Expected: Payment methods match the curator's settings

**Verification:**
- Check browser console for logs: `[checkout] Failed to fetch...`
- Check network tab for request to `/api/payment-methods?curatorId=xxx`
- Verify curatorId parameter is present and correct

#### Test Case 2: Multi-Curator Cart
**Steps:**
1. Add products from MULTIPLE curators to cart
2. Navigate to `/checkout`
3. Expected: Blue warning box appears
4. Expected: "Multiple Curators Detected" message
5. Expected: Payment methods from first curator displayed

**Verification:**
- Check console for: `[checkout] Cart contains items from multiple curators: Array(n)`
- Verify warning UI is visible
- Verify first curator's payment methods are shown

#### Test Case 3: Empty Cart
**Steps:**
1. Clear all items from cart
2. Navigate to `/checkout`
3. Expected: "Your Cart is Empty" message
4. Expected: No payment method fetch calls
5. Expected: No errors in console

#### Test Case 4: Payment Method Selection
**Steps:**
1. Add items to cart
2. Go to checkout
3. Select different payment methods (Stripe, Yape, Plin)
4. Expected: Appropriate forms/instructions appear
5. For Yape/Plin: QR code and phone number display correctly

**Verification:**
- QR code image loads from API response
- Phone number displays correctly
- Upload proof section appears for Yape/Plin

#### Test Case 5: Order Submission
**Steps:**
1. Fill all required fields
2. Submit order
3. Check order data in database or API response
4. Expected: Each item has correct `curatorId`
5. Expected: Order created successfully

**Database Check:**
```sql
SELECT * FROM orders ORDER BY createdAt DESC LIMIT 1;
SELECT * FROM order_items WHERE orderId = '<last-order-id>';
-- Verify curatorId field is populated correctly
```

## API Testing

### Test Payment Methods API
```bash
# Get curator ID from a product first
curl http://localhost:3000/api/products/some-product-slug | jq '.curatorId'

# Then fetch payment methods for that curator
curl "http://localhost:3000/api/payment-methods?curatorId=<curator-id>" | jq '.'
```

**Expected Response:**
```json
{
  "methods": [
    {
      "id": "yape",
      "name": "Yape",
      "type": "yape",
      "enabled": true,
      "phoneNumber": "987654321",
      "qrCode": "https://...",
      "instructions": "...",
      "icon": "Smartphone"
    }
  ],
  "defaultMethod": "yape",
  "commissionRate": 0.10
}
```

### Test Product API
```bash
# Fetch product to verify curator info is included
curl http://localhost:3000/api/products/some-product-slug | jq '.curator'
```

**Expected Response:**
```json
{
  "id": "curator_xxx",
  "userId": "user_xxx",
  "user": {
    "id": "user_xxx",
    "name": "Curator Name"
  }
}
```

## Console Log Checks

### Expected Logs (Happy Path):
```
[checkout] Fetching payment methods...
[checkout] Found X products in cart
[checkout] Using curator: curator_xxx
[checkout] Fetched Y payment methods
```

### Expected Logs (Multi-Curator):
```
[checkout] Cart contains items from multiple curators: ["curator_1", "curator_2"]
[checkout] Using first curator: curator_1
```

### Expected Logs (Errors):
```
[checkout] Failed to fetch product {productId}: <error>
[checkout] Failed to fetch payment methods: <error>
```

## Automated Testing (Future)

### Jest Test Cases
```typescript
describe('Checkout Page - Curator Payments', () => {
  it('should fetch product details on mount', async () => {
    // Test implementation
  })
  
  it('should detect multi-curator cart', () => {
    // Test implementation
  })
  
  it('should fetch payment methods with curatorId', async () => {
    // Test implementation
  })
  
  it('should handle empty cart', () => {
    // Test implementation
  })
  
  it('should include curatorId in order submission', async () => {
    // Test implementation
  })
})
```

## Performance Checks

### Network Requests
- Checkout should make N+1 requests (N products + 1 payment methods)
- All product fetches should happen in parallel
- Payment methods fetch should wait for product data

### Loading States
- Loading skeleton should show while fetching
- Page should not flash between states
- Error states should be user-friendly

## Regression Tests

**Ensure these still work:**
- [ ] Saved addresses selection
- [ ] Form validation
- [ ] Payment proof upload
- [ ] Transaction code entry
- [ ] Order summary display
- [ ] Stripe payment form
- [ ] Yape/Plin instructions
- [ ] Order confirmation redirect
- [ ] Cart clear on success

## Browser Testing

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations (MVP)

1. **Multi-curator checkout**: Uses only first curator's payment methods
2. **No caching**: Fetches product details every time
3. **No retry logic**: API failures show error message
4. **No partial cart**: If some products fail to load, still proceeds
5. **No curator indication**: Order summary doesn't show curator names

## Success Criteria

✅ Payment methods load correctly for single curator cart
✅ Multi-curator warning appears when needed
✅ Order submission includes correct curator IDs
✅ No console errors in happy path
✅ Empty cart handled gracefully
✅ Error states are user-friendly
✅ Page compiles without TypeScript errors
✅ No breaking changes to existing functionality

---

**Run Date**: _____________
**Tester**: _____________
**Status**: _____________
**Issues Found**: _____________
