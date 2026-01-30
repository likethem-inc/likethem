# Checkout Page - Curator-Specific Payment Methods Update

## Summary
Updated the checkout page to fetch and display payment methods specific to the curator whose products are in the cart.

## Changes Made

### 1. New Interface: `ProductDetails`
Added a new interface to handle product information including curator details:

```typescript
interface ProductDetails {
  id: string
  curatorId: string
  title: string
  price: number
  curator: {
    id: string
    userId: string
    user: {
      id: string
      name: string | null
    }
  }
}
```

### 2. New State Variables
Added three new state variables to manage product details, curator information, and multi-curator scenarios:

```typescript
const [productsDetails, setProductsDetails] = useState<Map<string, ProductDetails>>(new Map())
const [curatorId, setCuratorId] = useState<string | null>(null)
const [multiCuratorWarning, setMultiCuratorWarning] = useState(false)
```

### 3. Updated Payment Methods Fetching Logic
Completely rewrote the `useEffect` hook that fetches payment methods:

**Before:**
- Directly fetched from `/api/payment-methods` without any curator context
- Had no way to know which curator's payment settings to use

**After:**
- Step 1: Fetches product details for all cart items to get curator information
- Step 2: Extracts curator IDs and detects multi-curator scenarios
- Step 3: Uses the first curator's ID for payment methods (MVP approach)
- Step 4: Fetches payment methods with `curatorId` query parameter

**Key Features:**
- ✅ Handles empty cart gracefully (skips fetch)
- ✅ Only fetches products that have a `productId`
- ✅ Detects when cart has items from multiple curators
- ✅ Logs warning for multi-curator scenarios
- ✅ Falls back gracefully if curator info is missing
- ✅ Depends on `items` array to re-fetch when cart changes

### 4. Updated Order Submission
Modified `handleSubmit` to include actual curator IDs in order items:

**Before:**
```typescript
items: items.map(item => ({
  productId: item.id,
  quantity: item.quantity,
  size: undefined,
  color: undefined,
  curatorId: 'default' // Hardcoded default
}))
```

**After:**
```typescript
items: items.map(item => {
  const product = item.productId ? productsDetails.get(item.productId) : null
  return {
    productId: item.id,
    quantity: item.quantity,
    size: item.size || undefined,
    color: item.color || undefined,
    curatorId: product?.curatorId || curatorId || 'default' // Dynamic curator ID
  }
})
```

### 5. Multi-Curator Warning UI
Added a visual warning message that appears when the cart contains items from multiple curators:

```tsx
{multiCuratorWarning && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div className="flex items-start space-x-3">
      <div className="text-blue-600">
        <svg>...</svg>
      </div>
      <div className="text-sm text-blue-800">
        <p className="font-medium mb-1">Multiple Curators Detected</p>
        <p>Your cart contains items from multiple curators. For this checkout, 
           we'll use the payment methods of the first curator. Separate orders 
           will be created for each curator.</p>
      </div>
    </div>
  </div>
)}
```

### 6. Fixed Payment Instructions Rendering Bug
Fixed a syntax error in the manual payment instructions section (Yape/Plin):

**Before:**
- Had incorrect JSX structure with improperly nested return statement
- QR code image was using a hardcoded path instead of the method's actual QR code

**After:**
- Properly wrapped in an immediately invoked function expression (IIFE)
- Uses `selectedMethod.qrCode` from the API response
- All elements properly wrapped in a single parent `<div>`

## API Integration

### Payment Methods Endpoint
Now calls: `/api/payment-methods?curatorId={curatorId}`

The API expects a `curatorId` query parameter and returns curator-specific payment methods:

```typescript
interface PaymentMethodsResponse {
  methods: PaymentMethod[]
  defaultMethod: string
  commissionRate: number
}
```

### Product Details Endpoint
Fetches from: `/api/products/{productId}`

Returns product information including curator details.

## Edge Cases Handled

1. **Empty Cart**: Skips payment method fetch and sets loading to false
2. **Missing Product IDs**: Filters out cart items without `productId` before fetching
3. **Product Fetch Failures**: Logs errors but continues processing other products
4. **No Curator Found**: Throws error with clear message
5. **Multiple Curators**: Shows warning and uses first curator's payment methods
6. **Missing Curator in Order**: Falls back to `curatorId` state or 'default'

## User Experience Flow

1. User navigates to checkout with items in cart
2. Page shows loading state for payment methods
3. System fetches product details in parallel
4. If multiple curators detected, shows informational warning
5. Displays payment methods from the (first) curator
6. Auto-selects default or first available payment method
7. On submit, includes correct curator ID for each item

## Testing Recommendations

### Test Cases:
1. ✅ Single curator cart - should fetch and display that curator's payment methods
2. ✅ Multi-curator cart - should show warning and use first curator's methods
3. ✅ Empty cart - should not fetch payment methods
4. ✅ Cart items without productId - should handle gracefully
5. ✅ API failures - should show error message
6. ✅ No payment methods available - should show appropriate message
7. ✅ Cart updates - should re-fetch when items change

### Manual Testing:
```bash
# 1. Add products from a curator with custom payment methods
# 2. Go to checkout
# 3. Verify correct payment methods are displayed
# 4. Add products from another curator
# 5. Verify multi-curator warning appears
# 6. Submit order and verify curator IDs are correct
```

## Future Enhancements

1. **Split Checkout by Curator**: Instead of using the first curator's payment methods, create separate checkout flows for each curator
2. **Curator Selection**: Allow users to choose which curator to checkout first in multi-curator scenarios
3. **Optimistic UI**: Cache product details to avoid refetching on every visit
4. **Batch Product Fetch**: Create a single API endpoint to fetch multiple products at once
5. **Progressive Enhancement**: Show available payment methods immediately while fetching curator-specific ones

## Migration Notes

- **No Breaking Changes**: Existing functionality preserved
- **Backward Compatible**: Falls back to 'default' curator if needed
- **Database**: No schema changes required
- **Environment**: No new environment variables needed

## Files Modified

1. `app/checkout/page.tsx` - Main checkout page component

## Dependencies

No new dependencies added. Uses existing:
- Next.js fetch API
- React hooks (useState, useEffect)
- Cart Context
- Product API
- Payment Methods API

---

**Status**: ✅ Implementation Complete
**Tested**: ⏳ Pending manual testing
**Build**: ✅ Compiles successfully
