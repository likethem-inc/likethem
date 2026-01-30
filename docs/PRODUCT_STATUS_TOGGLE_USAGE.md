# Product Status Toggle - Quick Usage Guide

## For Curators

### How to Toggle Product Status

1. **Navigate to Your Products Dashboard**
   - Go to `/dashboard/curator/products`
   - You'll see all your products in a grid layout

2. **Locate the Product**
   - Find the product you want to activate/deactivate
   - Look for the three-dot menu button (⋮) in the top-right corner of each product card

3. **Open the Actions Menu**
   - Click the three-dot button
   - A dropdown menu will appear with options

4. **Toggle Status**
   - Click "Cambiar a Activo" (if product is currently inactive)
   - OR click "Cambiar a Inactivo" (if product is currently active)
   - The menu will show "Cambiando..." while processing

5. **Verify the Change**
   - The status badge in the top-right of the product image will update
   - Active products show a green badge with "Active"
   - Inactive products show a red badge with "Inactive"

### What Happens When You Toggle Status?

**Making a Product Inactive:**
- ❌ Product will NOT appear in your public store
- ❌ Product will NOT show up in search results
- ❌ Customers cannot view or purchase the product
- ✅ You can still see it in your dashboard
- ✅ You can reactivate it anytime

**Making a Product Active:**
- ✅ Product will appear in your public store
- ✅ Product will show up in search results
- ✅ Customers can view and purchase the product
- ✅ Visible to all visitors

### Other Menu Options

**View**
- Opens the public product page
- See what customers see

**Edit**
- Navigate to the product edit page
- Update title, price, images, description, etc.

**Delete** *(Optional)*
- Permanently remove the product
- Use with caution - this cannot be undone

## For Developers

### API Endpoint Usage

```javascript
// Toggle product status
const response = await fetch(`/api/curator/products/${productId}/status`, {
  method: 'PATCH',
  credentials: 'include',
})

const data = await response.json()
// Returns:
// {
//   message: "Product status updated successfully",
//   product: { /* full product object */ },
//   oldStatus: true,
//   newStatus: false
// }
```

### Component Usage

```tsx
import ProductDropdownMenu from '@/components/curator/ProductDropdownMenu'

<ProductDropdownMenu
  productId={product.id}
  isActive={product.isActive}
  onStatusChange={toggleProductStatus}
  onDelete={deleteProduct}  // Optional
/>
```

### Error Handling

The API returns different status codes:
- `200` - Success
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not the product owner or not a curator)
- `404` - Product not found
- `500` - Server error

### State Management

After successful toggle, update your local state:

```typescript
setProducts(prevProducts =>
  prevProducts.map(product =>
    product.id === productId
      ? { ...product, isActive: data.product.isActive }
      : product
  )
)
```

## Common Questions

**Q: Can I toggle multiple products at once?**
A: Not currently. Each product must be toggled individually.

**Q: Will toggling status affect my analytics?**
A: Active products continue to track views and interactions. Inactive products don't appear publicly but remain in your dashboard.

**Q: Can I schedule a product to become active later?**
A: Not in the current implementation. You must manually activate it.

**Q: What happens to pending orders if I deactivate a product?**
A: Existing orders are not affected. Only new customers are prevented from viewing/ordering.

**Q: Can I see a history of status changes?**
A: Not currently. This could be added as a future enhancement.

## Troubleshooting

**Problem: Status doesn't change after clicking**
- Check your internet connection
- Refresh the page and try again
- Check browser console for errors

**Problem: "Unauthorized" error**
- Make sure you're logged in
- Verify you have curator role
- Try logging out and back in

**Problem: Can toggle status but product still shows publicly**
- Clear your browser cache
- Check if the product is truly inactive (red badge)
- Contact support if issue persists

**Problem: Can't see the three-dot menu**
- Make sure you're on the curator products page
- Check if the page has fully loaded
- Try a different browser

## Best Practices

1. **Before Deactivating:**
   - Make sure you really want to hide the product
   - Consider if you have pending customer inquiries about it

2. **When Reactivating:**
   - Review the product details first
   - Ensure images and information are up-to-date
   - Check that pricing is current

3. **Seasonal Products:**
   - Deactivate off-season items
   - Reactivate when the season comes around
   - Keeps your store looking fresh and relevant

4. **Sold Items:**
   - Deactivate products that are sold out
   - Better than deleting (preserves history)
   - Can reference later for similar products

## Future Enhancements

Planned improvements:
- [ ] Bulk status toggle (select multiple products)
- [ ] Status change confirmation dialog
- [ ] Undo functionality
- [ ] Status change history/audit log
- [ ] Scheduled status changes
- [ ] Toast notifications for success/error
- [ ] Keyboard shortcuts

---

For technical details, see: `docs/PRODUCT_STATUS_TOGGLE_IMPLEMENTATION.md`
