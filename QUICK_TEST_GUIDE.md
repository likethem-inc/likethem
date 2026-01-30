# Quick Test Guide - Order Creation Fix

## 🎯 Quick Test Steps

### Test 1: Create an Order (5 minutes)

1. **Login as Buyer**
   ```
   Email: buyer@test.com (or create a new account)
   ```

2. **Add Product to Cart**
   - Go to any product page
   - Click "Add to Cart"
   - Verify item appears in cart (top right icon)

3. **Go to Checkout**
   - Click cart icon
   - Click "Checkout" or go to `/checkout`

4. **Fill Shipping Info**
   - Name: John Doe
   - Email: john@example.com
   - Address: 123 Main St
   - City: New York
   - State: NY
   - ZIP: 10001
   - Country: United States

5. **Select Payment Method**
   - Choose "Yape" or "Plin"
   - Enter transaction code: TEST12345
   - Upload payment proof (any image)

6. **Submit Order**
   - Click "Place Order"
   - **Expected**: Success! Redirected to confirmation
   - **Before Fix**: Error "Products not found"

### Test 2: Check Buyer Orders (2 minutes)

1. **Go to Orders Page**
   ```
   URL: /orders
   ```

2. **Verify**
   - ✅ Order appears in list
   - ✅ Product image shows
   - ✅ Correct amount
   - ✅ Status: PENDING_VERIFICATION

### Test 3: Check Curator Orders (3 minutes)

1. **Login as Curator** (owner of the product)
   ```
   If you don't have curator account:
   - Go to /sell
   - Create curator profile
   - Add a product
   - Logout and login as buyer
   - Order that product
   ```

2. **Go to Curator Orders**
   ```
   URL: /dashboard/curator/orders
   ```

3. **Verify**
   - ✅ Order appears in list
   - ✅ Buyer name shows
   - ✅ Payment proof visible
   - ✅ Can click "View Details"
   - ✅ Can "Mark as Paid"

### Test 4: Verify Stock Updated (1 minute)

1. **Before Order**: Note product stock quantity
2. **Create Order**: Order 2 units
3. **After Order**: Check product page
   - ✅ Stock decreased by 2

---

## 🐛 What to Look For

### ✅ Success Indicators

**During Checkout**:
- No console errors
- Loading state shows
- Success message
- Redirect to confirmation

**In Orders Page**:
- Orders list loads
- Product images display
- All order data correct

**In Curator Dashboard**:
- Orders appear (not empty)
- Buyer info shows
- Payment proof displays
- Actions work (Mark as Paid)

### ❌ Failure Indicators

**Still Broken**:
- "Products not found or inactive" error
- "Insufficient stock" error (when stock is available)
- Empty orders list (when orders exist)
- 404 errors in network tab
- Console errors about product not found

**New Issues**:
- 403 Forbidden in curator view
- Buyer info missing in curator view
- Wrong orders showing

---

## 🔍 Debug Checklist

If tests fail, check:

### 1. Check Browser Console
```javascript
// Should NOT see:
❌ "Products not found"
❌ "Product not found: cart-item-..."
❌ "Failed to create order"

// Should see:
✅ "Order created successfully"
✅ Status 201 from /api/orders
```

### 2. Check Network Tab

**Order Creation Request**:
```json
POST /api/orders
Body:
{
  "items": [
    {
      "productId": "clx...",  // ✅ Should start with product prefix
      "quantity": 1
    }
  ]
}
```

**Curator Orders Request**:
```
GET /api/orders?view=curator  // ✅ Should have ?view=curator
```

### 3. Check Database

```sql
-- Check if order was created
SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;

-- Check order items (should have product_id, not cart_item_id)
SELECT * FROM order_items ORDER BY id DESC LIMIT 1;

-- Check if curator exists
SELECT * FROM curator_profiles WHERE user_id = 'your-user-id';
```

### 4. Common Issues & Solutions

**Issue**: Orders still not creating
```
Solution: 
- Clear browser cache
- Check cart items have productId field
- Verify products are active
- Check product has stock
```

**Issue**: Curator orders showing empty
```
Solution:
- Verify you're logged in as curator
- Check curator profile exists
- Verify orders are for YOUR products
- Check ?view=curator in URL
```

**Issue**: 403 Forbidden in curator view
```
Solution:
- User doesn't have curator profile
- Go to /sell and create profile
- Or login as different user with curator role
```

---

## 📊 Test Results Template

Use this to document your tests:

```
=== Order Creation Test Results ===
Date: [DATE]
Tester: [NAME]

Test 1: Create Order
- Add to cart: [ ] Pass [ ] Fail
- Checkout form: [ ] Pass [ ] Fail
- Payment method: [ ] Pass [ ] Fail
- Order submit: [ ] Pass [ ] Fail
- Redirect: [ ] Pass [ ] Fail
Issues: 

Test 2: Buyer Orders
- Orders load: [ ] Pass [ ] Fail
- Order displays: [ ] Pass [ ] Fail
- Details correct: [ ] Pass [ ] Fail
Issues:

Test 3: Curator Orders
- Login as curator: [ ] Pass [ ] Fail
- Orders load: [ ] Pass [ ] Fail
- Buyer info shows: [ ] Pass [ ] Fail
- Actions work: [ ] Pass [ ] Fail
Issues:

Test 4: Stock Management
- Stock before: [NUMBER]
- Order quantity: [NUMBER]
- Stock after: [NUMBER]
- Correct: [ ] Yes [ ] No

Overall Result: [ ] ALL PASS [ ] SOME FAIL [ ] ALL FAIL
```

---

## 🚨 Rollback Instructions

If critical issues found:

### Quick Rollback (Git)
```bash
cd /home/runner/work/likethem/likethem

# Revert the changes
git checkout HEAD -- app/checkout/page.tsx
git checkout HEAD -- app/api/orders/route.ts
git checkout HEAD -- app/dashboard/curator/orders/page.tsx

# Rebuild
npm run build
```

### Manual Rollback

**File 1**: `app/checkout/page.tsx` line 290
```typescript
// Change back to:
productId: item.id,
```

**File 2**: `app/api/orders/route.ts`
- Revert GET method to only support buyer view
- Remove curator logic

**File 3**: `app/dashboard/curator/orders/page.tsx` line 51
```typescript
// Change back to:
const response = await fetch('/api/orders', {
```

---

## 💡 Quick Commands

### Check Build
```bash
npm run build
```

### Start Dev Server
```bash
npm run dev
```

### Check Database
```bash
npx prisma studio
```

### View Logs
```bash
# Check for errors
tail -f logs/error.log

# In browser console
localStorage.debug = '*'
```

---

## 📞 Need Help?

**Files to check**:
1. `ORDER_CREATION_BUG_ANALYSIS.md` - Full technical analysis
2. `ORDER_CREATION_FIXES_APPLIED.md` - Detailed fix documentation
3. This file - Quick testing guide

**Key changes**:
- Line 290 in checkout page: `item.id` → `item.productId`
- Orders API: Added curator view support
- Curator page: Added `?view=curator` parameter

**Emergency contact**: Check your team's communication channel

---

## ✅ Definition of Done

Tests pass when:
- [ ] Can create order without errors
- [ ] Order appears in buyer's orders page
- [ ] Order appears in curator's orders page
- [ ] Stock is updated correctly
- [ ] Payment proof is visible
- [ ] Status updates work
- [ ] No console errors
- [ ] No 404/500 errors in network tab

Good luck! 🚀
