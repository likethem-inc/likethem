# Cart Stock Validation Implementation

## Overview
This implementation adds stock validation to the shopping cart to ensure users can only add items up to the available stock quantity. The validation is done per product variant (size/color combination).

## Changes Made

### 1. API Changes (`app/api/cart/route.ts`)

#### Added Stock Validation Import
```typescript
import { checkVariantAvailability } from '@/lib/inventory/variants'
```

#### POST Endpoint (Add to Cart)
- Added validation to check variant stock before adding items
- Returns error if requested quantity exceeds available stock
- Error message includes available stock quantity

#### PUT Endpoint (Update Cart Quantity)
- Added validation to check variant stock before updating quantity
- Fetches existing cart item to get variant information
- Returns error if new quantity exceeds available stock

#### GET Endpoint (Fetch Cart)
- Enhanced to return stock information for each cart item
- Includes `availableStock` and `isOutOfStock` flags
- Uses `checkVariantAvailability` function for each variant

### 2. Cart Context Updates (`contexts/CartContext.tsx`)

#### Updated CartItem Interface
```typescript
interface CartItem {
  // ... existing fields
  availableStock?: number
  isOutOfStock?: boolean
}
```

#### Enhanced addItem Function
- Added error handling for stock validation failures
- Implements optimistic updates with rollback on error
- Properly reverts local state if API returns stock error

### 3. Cart Page UI Updates (`app/cart/page.tsx`)

#### Stock Status Display
- Shows "Out of Stock" warning for unavailable items
- Shows "Limited Stock" warning when quantity exceeds available
- Displays available stock quantity in warnings

#### Quantity Selector
- Limited to available stock (max 10 or available stock, whichever is lower)
- Disabled when item is out of stock

#### Checkout Button
- Disabled when any items are out of stock or exceed available quantity
- Shows clear error message explaining why checkout is blocked

## Testing Instructions

### Prerequisites
1. Database with products containing variants
2. Run variant initialization: `npm run init:variants`
3. Ensure some variants have limited stock (e.g., stockQuantity < 10)

### Test Cases

#### Test Case 1: Add Item Within Stock Limit
1. Find a product with a variant that has stock > 0
2. Add item to cart
3. **Expected**: Item successfully added to cart

#### Test Case 2: Add Item Exceeding Stock
1. Find a product variant with limited stock (e.g., stockQuantity = 2)
2. Add 2 items to cart successfully
3. Try to add 1 more item
4. **Expected**: API returns error "Insufficient stock. Only 2 items available."

#### Test Case 3: Update Quantity Beyond Stock
1. Add item to cart (quantity = 1)
2. Try to update quantity to exceed available stock
3. **Expected**: API returns stock validation error

#### Test Case 4: Out of Stock Item Display
1. Simulate another user buying the last item (set stockQuantity = 0)
2. Refresh cart page
3. **Expected**: 
   - "Out of Stock" warning displayed
   - Quantity selector disabled
   - Checkout button disabled
   - Message: "Please remove out of stock items from your cart"

#### Test Case 5: Limited Stock Warning
1. Add item with quantity = 5 to cart
2. Reduce stock to 3 (simulate another purchase)
3. Refresh cart page
4. **Expected**:
   - "Limited Stock" warning displayed
   - Message: "Only 3 items available. Please adjust quantity."
   - Quantity selector limited to 1-3

#### Test Case 6: Multiple Items with Stock Issues
1. Add multiple items to cart
2. Make one item out of stock
3. Make another exceed available quantity
4. **Expected**:
   - Both items show appropriate warnings
   - Checkout button disabled
   - Clear message about stock issues

### API Testing with curl

```bash
# Get cart (authenticated request)
curl -X GET 'http://localhost:3000/api/cart' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN'

# Add to cart
curl -X POST 'http://localhost:3000/api/cart' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 1,
    "size": "M",
    "color": "Black"
  }'

# Update quantity
curl -X PUT 'http://localhost:3000/api/cart' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: next-auth.session-token=YOUR_SESSION_TOKEN' \
  -d '{
    "itemId": "CART_ITEM_ID",
    "quantity": 5
  }'
```

## Key Features

### ✅ Stock Validation on Add
- Checks variant stock before adding to cart
- Prevents adding more than available quantity
- Returns clear error messages

### ✅ Stock Validation on Update
- Validates quantity changes against available stock
- Prevents exceeding stock limits

### ✅ Real-time Stock Display
- Shows available stock for each cart item
- Updates on cart refresh

### ✅ Out of Stock Detection
- Identifies items with zero stock
- Prevents checkout with out of stock items

### ✅ User-Friendly UI
- Clear warning messages
- Disabled controls for invalid actions
- Limited quantity selectors

### ✅ Checkout Protection
- Blocks checkout when stock issues exist
- Explains what needs to be fixed

## Error Handling

### API Errors
```json
{
  "error": "Insufficient stock. Only 3 items available."
}
```

### Client-Side Handling
- Optimistic updates with rollback on failure
- Error messages displayed to user
- State consistency maintained

## Future Enhancements

1. **Real-time Stock Updates**: WebSocket integration for live stock updates
2. **Stock Reservation**: Hold stock temporarily during checkout process
3. **Waitlist**: Allow users to join waitlist for out of stock items
4. **Stock Notifications**: Email alerts when items come back in stock
5. **Alternative Variants**: Suggest similar available variants

## Dependencies

- `@prisma/client`: Database ORM
- `lib/inventory/variants.ts`: Stock checking utilities
- `lib/api-auth.ts`: Authentication helpers

## Database Schema

The implementation relies on the `ProductVariant` model:
```prisma
model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  size          String
  color         String
  stockQuantity Int      @default(0)
  sku           String?  @unique
  // ...
}
```

## Notes

- Stock validation is done per variant (size + color combination)
- Unauthenticated users: Cart stored in localStorage (no stock validation)
- Authenticated users: Cart stored in database (full stock validation)
- Stock checks are performed on every cart operation
- The system prevents overselling by validating at multiple points

## Support

For issues or questions, please refer to:
- Inventory management documentation: `INVENTORY_MANAGEMENT_GUIDE.md`
- Variant management: `README_VARIANT_MANAGEMENT.md`
- API authentication: `lib/api-auth.ts`
