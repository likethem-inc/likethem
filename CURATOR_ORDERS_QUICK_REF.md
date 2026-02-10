# 🚀 Curator Orders - Quick Reference

## Status Flow

```
PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED
                   ↓                      ↓
                REJECTED            FAILED_ATTEMPT
                                         ↓
                                    [Retry] → SHIPPED
```

## Action Shortcuts

| Status | Action | Shortcut Keys | Next Status |
|--------|--------|---------------|-------------|
| PENDING_PAYMENT | Mark Paid | - | PAID |
| PENDING_PAYMENT | Reject | - | REJECTED |
| PAID | Start Processing | - | PROCESSING |
| PROCESSING | Ship Order | + Form | SHIPPED |
| SHIPPED | Mark Delivered | - | DELIVERED |
| SHIPPED | Failed Attempt | - | FAILED_ATTEMPT |
| FAILED_ATTEMPT | Retry | + Form | SHIPPED |

## Required Fields

### Shipping Form (PROCESSING → SHIPPED)
- ✅ **Courier** (required)
- ⭕ Tracking Number (optional)
- ⭕ Estimated Delivery Date (optional)

### Retry Shipping (FAILED_ATTEMPT → SHIPPED)
- ✅ **Courier** (required)
- ⭕ Tracking Number (optional)
- ⭕ Estimated Delivery Date (optional)
- 📝 Pre-fills existing data

## Status Icons Quick Reference

| Icon | Status | Color |
|------|--------|-------|
| 🕐 | PENDING_PAYMENT | Yellow |
| ✅ | PAID | Green |
| ❌ | REJECTED | Red |
| 📦 | PROCESSING | Blue |
| 🚚 | SHIPPED | Indigo |
| ✅ | DELIVERED | Emerald |
| ⚠️ | FAILED_ATTEMPT | Orange |
| ❌ | CANCELLED | Gray |
| ↻ | REFUNDED | Purple |

## API Endpoints

### Update Order Status
```bash
PUT /api/orders/:orderId
Content-Type: application/json

{
  "status": "SHIPPED",
  "courier": "FedEx",
  "trackingNumber": "123456789",
  "estimatedDeliveryDate": "2024-01-15"
}
```

### Get Orders (Curator View)
```bash
GET /api/orders?view=curator
```

## Filter Buttons

Available filters:
- All Orders
- PENDING PAYMENT
- PAID
- REJECTED
- PROCESSING
- SHIPPED
- DELIVERED
- FAILED ATTEMPT
- CANCELLED
- REFUNDED

## Stats Cards

1. **Pending Payment** - Count of orders awaiting payment
2. **Paid** - Count of confirmed payments
3. **Processing** - Count of orders being prepared
4. **Total Revenue** - Sum of all order amounts

## Common Tasks

### Confirm a Payment
1. Click order card or eye icon
2. Review payment proof
3. Click "Mark as Paid"

### Ship an Order
1. Find order in PROCESSING status
2. Click "Mark as Shipped"
3. Enter courier name (required)
4. Add tracking number (optional)
5. Set delivery date (optional)
6. Click "Confirm Shipment"

### Handle Failed Delivery
1. Find SHIPPED order
2. Click "Failed Attempt"
3. To retry: Click "Retry Shipping"
4. Update shipping info
5. Click "Retry Shipment"

## Keyboard Navigation

- Tab: Move between elements
- Enter/Space: Activate buttons
- Escape: Close modal (when implemented)

## Mobile View

- Stats cards stack vertically
- Filter buttons wrap to multiple lines
- Action buttons wrap in order cards
- Modal becomes full-screen on small devices

## Troubleshooting

### Action button not appearing?
- Check if order is in correct status
- Refresh the page
- Verify user role is 'curator'

### Can't submit shipping form?
- Ensure courier field is filled (required)
- Check for validation errors
- Try clicking "Confirm Shipment" again

### Order not updating?
- Check console for errors
- Verify API endpoint is working
- Ensure database connection

## Best Practices

✅ **DO:**
- Review payment proof before confirming
- Add tracking numbers when available
- Set realistic delivery dates
- Handle failed deliveries promptly

❌ **DON'T:**
- Skip the courier field (it's required)
- Mark as delivered without confirmation
- Change status without proper verification

## Data Types

```typescript
interface ShippingInfo {
  courier: string              // Max 255 chars
  trackingNumber?: string      // Max 100 chars
  estimatedDeliveryDate?: string // ISO date format
}
```

## Validation Rules

- Courier: Required when shipping, 1-255 characters
- Tracking Number: Optional, max 100 characters
- Estimated Delivery Date: Optional, valid date format

## Performance

- Orders load on mount
- Auto-refresh after status update
- Optimistic UI updates
- Local state management for forms

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Related Documentation

- [Full Update Guide](./CURATOR_ORDERS_UPDATE.md)
- [Visual Guide](./CURATOR_ORDERS_VISUAL_GUIDE.md)
- [Order System Analysis](./ORDER_SYSTEM_COMPREHENSIVE_ANALYSIS.md)

## Quick Code Snippets

### Update Status (Simple)
```typescript
updateOrderStatus(orderId, 'PAID')
```

### Update Status with Shipping
```typescript
updateOrderStatus(orderId, 'SHIPPED', {
  courier: 'FedEx',
  trackingNumber: '123456789',
  estimatedDeliveryDate: '2024-01-15'
})
```

### Filter by Status
```typescript
const filteredOrders = orders.filter(o => o.status === 'PROCESSING')
```

### Count by Status
```typescript
const paidCount = orders.filter(o => o.status === 'PAID').length
```

## Support

For issues or questions:
1. Check this reference guide
2. Review full documentation
3. Check console for errors
4. Contact development team

---

**Last Updated:** December 2024
**File:** `/app/dashboard/curator/orders/page.tsx`
**Version:** 2.0
