# Dynamic Payment Methods - Checkout Page Update

## Overview
Updated the checkout page (`app/checkout/page.tsx`) to dynamically fetch and display payment methods from the backend API instead of using hardcoded values.

## Changes Made

### 1. **New Interfaces Added**
```typescript
interface PaymentMethod {
  id: string
  name: string
  type: 'stripe' | 'yape' | 'plin'
  enabled: boolean
  phoneNumber?: string
  qrCode?: string
  instructions?: string
  icon: string
}

interface PaymentMethodsResponse {
  methods: PaymentMethod[]
  defaultMethod: string
  commissionRate: number
}
```

### 2. **New State Variables**
- `paymentMethods`: Stores the fetched payment methods array
- `isLoadingPaymentMethods`: Tracks loading state
- `paymentMethodsError`: Stores error messages if fetch fails

### 3. **New useEffect Hook**
Fetches payment methods from `/api/payment-methods` on component mount:
- Handles loading, success, and error states
- Auto-selects the default payment method or first enabled method
- Gracefully handles API failures

### 4. **Dynamic Payment Method Selection**
Replaced hardcoded payment method options with dynamic rendering:
- Only shows payment methods that are enabled
- Displays correct icon based on method type (CreditCard, Smartphone, QrCode)
- Uses method names and descriptions from API

### 5. **Loading State UI**
Shows animated skeleton loaders while fetching payment methods:
```
[Animated placeholder boxes]
```

### 6. **Error State UI**
Displays user-friendly error message if API call fails:
```
⚠️ Unable to load payment methods. Please refresh the page.
```

### 7. **No Methods Available UI**
Shows warning message if no payment methods are enabled:
```
⚠️ No payment methods available
Please contact support to complete your order.
```

### 8. **Dynamic QR Code & Phone Number Display**
For Yape/Plin payments:
- QR code image source comes from API (`selectedMethod.qrCode`)
- Phone number comes from API (`selectedMethod.phoneNumber`)
- Instructions come from API (`selectedMethod.instructions`)
- Falls back to default instructions if none provided

### 9. **Icon Support**
Added `Smartphone` icon import from lucide-react to support mobile payment methods.

## Features Maintained

✅ All existing checkout functionality preserved:
- Shopping cart display
- Shipping address selection (saved addresses)
- Payment processing logic
- Order creation flow
- Form validation
- Existing UI styling and layout

✅ No breaking changes to:
- `handleSubmit` function
- Address management
- File upload functionality
- Order creation API calls

## API Integration

### Endpoint
`GET /api/payment-methods`

### Expected Response
```json
{
  "methods": [
    {
      "id": "yape",
      "name": "Yape",
      "type": "yape",
      "enabled": true,
      "phoneNumber": "+51 999 888 777",
      "qrCode": "https://cloudinary.com/.../yape-qr.png",
      "instructions": "Realiza el pago escaneando el código QR...",
      "icon": "Smartphone"
    },
    {
      "id": "stripe",
      "name": "Tarjeta de Crédito/Débito",
      "type": "stripe",
      "enabled": true,
      "icon": "CreditCard"
    }
  ],
  "defaultMethod": "stripe",
  "commissionRate": 0.10
}
```

## User Experience Flow

1. **Page Load**
   - Shows loading skeletons for payment methods
   - Fetches payment methods from API in parallel with addresses

2. **Success State**
   - Displays all enabled payment methods as radio buttons
   - Auto-selects default or first method
   - Shows payment-specific UI when method is selected

3. **Payment Method Selection**
   - User can choose from available methods
   - Stripe: Shows card input fields
   - Yape/Plin: Shows QR code, phone number, and upload fields

4. **Error Handling**
   - Network errors: Shows error message with retry suggestion
   - No methods: Shows warning to contact support
   - Doesn't block other functionality

## Testing Checklist

- [ ] Payment methods load on page mount
- [ ] Loading state shows skeleton UI
- [ ] Default payment method is auto-selected
- [ ] Only enabled methods are displayed
- [ ] QR codes display correctly from API
- [ ] Phone numbers display correctly from API
- [ ] Instructions display correctly
- [ ] Error state shows when API fails
- [ ] No methods state shows when array is empty
- [ ] Can still complete checkout with Stripe
- [ ] Can still complete checkout with Yape/Plin
- [ ] Form validation still works
- [ ] Order creation still works

## Benefits

1. **Dynamic Configuration**: Admin can enable/disable payment methods without code changes
2. **Centralized Management**: Payment settings managed in one place (admin panel)
3. **Flexible**: Easy to add new payment methods in the future
4. **User-Friendly**: Clear loading and error states
5. **Maintainable**: Reduces hardcoded values
6. **Scalable**: Supports any number of payment methods

## Backwards Compatibility

✅ **Fully backwards compatible**
- If API fails, shows error but doesn't crash
- Existing order processing logic unchanged
- No database schema changes required
- No breaking changes to other components

## Future Enhancements

Potential improvements for future iterations:
1. Add retry button on error state
2. Cache payment methods in localStorage
3. Add payment method icons from API
4. Support for more payment method types
5. Real-time updates when admin changes settings
6. A/B testing different payment method orders
