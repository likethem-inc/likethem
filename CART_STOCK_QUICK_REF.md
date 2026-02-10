# Quick Reference: Cart Stock Validation

## Summary of Changes

### Files Modified
1. **app/api/cart/route.ts** - API stock validation
2. **app/cart/page.tsx** - UI warnings and limits
3. **contexts/CartContext.tsx** - Error handling and stock data

### Key Features Implemented

#### ✅ API Stock Validation
- Validates stock when adding items (POST)
- Validates stock when updating quantity (PUT)
- Returns stock information with cart items (GET)

#### ✅ Cart Page UI Enhancements
- Out of stock warnings (red alert)
- Limited stock warnings (amber alert)
- Quantity selector limited to available stock
- Checkout button disabled with stock issues

#### ✅ Error Handling
- Optimistic updates with rollback
- Clear error messages
- User-friendly notifications

## Quick Test Checklist

- [ ] Can add item within stock limit
- [ ] Cannot add item exceeding stock
- [ ] Cannot update quantity beyond stock
- [ ] Out of stock items show warning
- [ ] Limited stock shows correct quantity
- [ ] Checkout disabled with stock issues
- [ ] Quantity selector respects stock limits

## API Response Examples

### Success (GET /api/cart)
```json
{
  "items": [
    {
      "id": "cart123",
      "productId": "prod123",
      "name": "Product Name",
      "size": "M",
      "color": "Black",
      "quantity": 2,
      "price": 29.99,
      "availableStock": 5,
      "isOutOfStock": false
    }
  ]
}
```

### Error (POST /api/cart - Insufficient Stock)
```json
{
  "error": "Insufficient stock. Only 2 items available."
}
```

## Code Snippets

### Check Stock Before Adding
```typescript
const variantAvailability = await checkVariantAvailability(
  productId,
  size,
  color,
  requestedQuantity
)

if (!variantAvailability.available) {
  return createApiErrorResponse(
    `Insufficient stock. Only ${variantAvailability.stockQuantity} items available.`,
    400
  )
}
```

### Cart UI Stock Warning
```tsx
{item.isOutOfStock && (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-800 font-medium">Out of Stock</p>
    <p className="text-xs text-red-600 mt-1">
      This item is no longer available. Please remove it from your cart.
    </p>
  </div>
)}
```

## Development Notes

- Uses `lib/inventory/variants.ts` for stock checking
- Stock validation is per variant (size + color)
- Unauthenticated users have no stock validation (localStorage only)
- All database operations use Prisma ORM

## Acceptance Criteria Status

✅ Users can only add available products to cart
✅ Quantity limited by stock per variant  
✅ Out of stock items show warning
✅ Checkout blocked with stock issues
✅ Clear error messages for users
✅ Stock information displayed in cart

## Related Files
- `lib/inventory/variants.ts` - Stock utilities
- `prisma/schema.prisma` - Database schema (ProductVariant)
- `CART_STOCK_VALIDATION.md` - Full documentation
