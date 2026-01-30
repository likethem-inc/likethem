# 🛒 Order Creation Feature - Quick Start

## 📦 What Was Added?

A complete order creation system that:
- ✅ Creates orders from cart items
- ✅ Supports multiple curators in one checkout
- ✅ Handles Stripe, Yape, and Plin payments
- ✅ Validates stock and payment settings
- ✅ Calculates commissions automatically
- ✅ Updates product stock atomically

## 🚀 Quick Start (5 minutes)

### 1. Understand the Endpoint

**POST `/api/orders`** - Create new order(s)

**Requires:**
- User authentication (logged in)
- Valid cart items with product IDs
- Complete shipping address
- Payment method selection

**Returns:**
- Array of created orders (one per curator)
- Order IDs, totals, and status

### 2. Basic Request Example

```json
POST /api/orders
Content-Type: application/json

{
  "items": [
    {
      "productId": "clx123abc",
      "quantity": 2,
      "size": "M",
      "color": "Blue",
      "curatorId": "clx456def"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe"
}
```

### 3. Response Example

```json
{
  "success": true,
  "orders": [
    {
      "id": "clx111aaa",
      "buyerId": "clx222bbb",
      "curatorId": "clx456def",
      "status": "PENDING",
      "totalAmount": 149.99,
      "commission": 14.99,
      "curatorAmount": 135.00,
      "paymentMethod": "stripe",
      "items": [...],
      "shippingAddress": {...}
    }
  ],
  "message": "1 order(s) created successfully"
}
```

## 🎯 Key Features

### Multi-Curator Support

If your cart has items from **multiple curators**, the system automatically:

1. Groups items by curator
2. Creates **separate orders** for each curator
3. Calculates individual commissions
4. Returns all orders in one response

**Example:** Cart with items from 3 curators → 3 orders created

### Commission Calculation

```
Subtotal = Sum of (item.price × item.quantity)
Commission = Subtotal × Commission Rate (from settings)
Curator Amount = Subtotal - Commission
```

**Example** (10% commission rate):
- Subtotal: $100
- Commission: $10 (10%)
- Curator receives: $90

### Payment Methods

| Method | Status | Requires |
|--------|--------|----------|
| **Stripe** | `PENDING` | Enabled in settings |
| **Yape** | `PENDING_VERIFICATION` | Enabled + Transaction code |
| **Plin** | `PENDING_VERIFICATION` | Enabled + Transaction code |

### Stock Management

- ✅ Validates stock before order creation
- ✅ Decrements stock atomically (transaction)
- ✅ Rolls back if any step fails
- ✅ Prevents overselling

## 📝 Request Validation

The endpoint validates:

| Check | Error | Status |
|-------|-------|--------|
| User logged in | Unauthorized | 401 |
| Items array not empty | Cart items required | 400 |
| Products exist | Product not found | 404 |
| Products are active | Product not found | 404 |
| Sufficient stock | Insufficient stock | 400 |
| Complete address | Address required | 400 |
| Valid payment method | Invalid payment method | 400 |
| Payment method enabled | Not enabled | 400 |
| Transaction code (Yape/Plin) | Code required | 400 |

## 🧪 Testing

### Option 1: Test Script

```bash
node test-orders-api.js
```

This runs validation tests (no auth required).

### Option 2: Manual with cURL

```bash
# 1. Get your session token (login first)
# 2. Run the request

curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "YOUR_PRODUCT_ID",
        "quantity": 1,
        "curatorId": "YOUR_CURATOR_ID"
      }
    ],
    "shippingAddress": {
      "name": "Test User",
      "email": "test@example.com",
      "address": "123 Test St",
      "city": "Test City",
      "state": "TS",
      "zipCode": "12345",
      "country": "Test Country"
    },
    "paymentMethod": "stripe"
  }'
```

### Option 3: Frontend Integration

```typescript
// In your checkout component
import { CreateOrderRequest } from '@/types/order';

const createOrder = async (orderData: CreateOrderRequest) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};
```

## 📁 Files Created/Modified

### Modified
- ✅ `app/api/orders/route.ts` - Added POST endpoint (327 lines)

### Created
- ✅ `types/order.ts` - TypeScript types (142 lines)
- ✅ `docs/ORDERS_API.md` - Full documentation (518 lines)
- ✅ `docs/ORDER_IMPLEMENTATION_SUMMARY.md` - Implementation summary
- ✅ `test-orders-api.js` - Test script (265 lines)

**Total:** ~1,252 lines of code + documentation

## 🔍 Common Use Cases

### Single Curator Checkout

**Scenario:** User buys 2 items from one curator

**Result:** 1 order created

```json
{
  "orders": [
    {
      "id": "order1",
      "curatorId": "curator1",
      "items": [
        { "productId": "prod1", "quantity": 2 },
        { "productId": "prod2", "quantity": 1 }
      ]
    }
  ]
}
```

### Multi-Curator Checkout

**Scenario:** User buys from 2 different curators

**Result:** 2 orders created

```json
{
  "orders": [
    {
      "id": "order1",
      "curatorId": "curator1",
      "items": [{ "productId": "prod1", "quantity": 2 }]
    },
    {
      "id": "order2",
      "curatorId": "curator2",
      "items": [{ "productId": "prod3", "quantity": 1 }]
    }
  ]
}
```

### Yape/Plin Payment

**Scenario:** User pays with Yape

**Request:**
```json
{
  "paymentMethod": "yape",
  "transactionCode": "YPE123456789"
}
```

**Result:** Order status = `PENDING_VERIFICATION`

### Stripe Payment

**Scenario:** User selects Stripe

**Request:**
```json
{
  "paymentMethod": "stripe"
}
```

**Result:** Order status = `PENDING`

## ⚠️ Important Notes

### Database Transactions

All order creation happens in a **single transaction**:

```
START TRANSACTION
  → Create order(s)
  → Create order items
  → Create shipping address
  → Update product stock
COMMIT (or ROLLBACK on error)
```

This ensures data consistency.

### Payment Method Settings

Before using a payment method, ensure it's enabled:

1. Go to Admin Settings
2. Navigate to Payment Settings
3. Enable the desired method
4. Configure required fields (phone, QR code)

### Stock Validation

The system checks stock **twice**:

1. **Before transaction**: Validates all items
2. **During transaction**: Atomic decrement

This prevents race conditions.

## 🚀 Next Steps

### For Frontend Developers

1. **Review types**: Check `types/order.ts`
2. **Integrate endpoint**: Use in checkout flow
3. **Handle errors**: Display appropriate messages
4. **Show confirmation**: Display order details

### For Backend Developers

1. **Review code**: Check `app/api/orders/route.ts`
2. **Test edge cases**: Insufficient stock, etc.
3. **Add Stripe**: Implement payment processing
4. **Add webhooks**: Handle payment events

### For QA/Testers

1. **Run test script**: `node test-orders-api.js`
2. **Test validation**: All error scenarios
3. **Test multi-curator**: Multiple curators in cart
4. **Test stock**: Verify stock decrements
5. **Test payments**: All payment methods

## 📖 Full Documentation

For complete details, see:

- **API Reference**: `docs/ORDERS_API.md`
- **Implementation**: `docs/ORDER_IMPLEMENTATION_SUMMARY.md`
- **Types**: `types/order.ts`
- **Test Script**: `test-orders-api.js`

## ✅ Checklist

Before deploying, ensure:

- [ ] Payment settings are configured
- [ ] At least one payment method is enabled
- [ ] Products have correct stock quantities
- [ ] Commission rate is set (default 10%)
- [ ] Test orders can be created
- [ ] Stock decrements correctly
- [ ] Multi-curator scenarios work
- [ ] All validation errors are handled

## 🎯 Success Criteria

✅ **Ready for production if:**

- All tests pass
- Orders are created successfully
- Stock updates correctly
- Commission calculated accurately
- Multi-curator splitting works
- Payment methods validate correctly
- Error handling is robust

---

**Implementation Date**: January 30, 2024  
**Status**: ✅ Complete and ready for testing  
**Breaking Changes**: None  
**Database Migrations**: None required

**Questions?** See `docs/ORDERS_API.md` for complete documentation.
