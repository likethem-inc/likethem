# Orders API Documentation

## Overview

The Orders API handles order creation, listing, and management for the likethem platform. It supports multiple payment methods (Stripe, Yape, Plin) and automatically handles multi-curator cart scenarios.

## Endpoints

### GET `/api/orders`

Fetch paginated list of orders for the authenticated user.

#### Authentication
✅ **Required** - User must be logged in

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

#### Response

```typescript
{
  page: number;
  limit: number;
  total: number;
  pages: number;
  orders: Order[];
}
```

#### Example

```bash
curl -X GET "https://likethem.com/api/orders?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=..."
```

---

### POST `/api/orders`

Create new order(s) from cart items. If cart contains items from multiple curators, multiple orders will be created automatically.

#### Authentication
✅ **Required** - User must be logged in

#### Request Body

```typescript
{
  items: Array<{
    productId: string;      // Product ID
    quantity: number;       // Quantity to order
    size?: string;          // Optional size variant
    color?: string;         // Optional color variant
    curatorId: string;      // Curator ID (owner of product)
  }>;
  shippingAddress: {
    name: string;           // Recipient name
    email: string;          // Contact email
    phone?: string;         // Contact phone (optional)
    address: string;        // Street address
    city: string;           // City
    state: string;          // State/Province
    zipCode: string;        // Postal code
    country: string;        // Country
  };
  paymentMethod: 'stripe' | 'yape' | 'plin';  // Payment method
  transactionCode?: string;   // Required for yape/plin
  paymentProof?: string;      // Optional payment proof URL
}
```

#### Validation Rules

1. **Authentication**: User must be logged in
2. **Items**: 
   - Must be a non-empty array
   - Each product must exist and be active
   - Each product must have sufficient stock
3. **Shipping Address**: All required fields must be provided
4. **Payment Method**:
   - Must be one of: `stripe`, `yape`, `plin`
   - Must be enabled in PaymentSettings
   - For `yape` or `plin`: `transactionCode` is required
5. **Stock**: Product stock is validated and decremented atomically

#### Response

```typescript
{
  success: true;
  orders: Order[];
  message: string;
}
```

#### Order Status

The initial order status depends on the payment method:

- **Stripe**: `PENDING` - Awaiting payment processing
- **Yape/Plin**: `PENDING_VERIFICATION` - Awaiting admin verification of payment proof

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | User not authenticated |
| 400 | Invalid payment method | Payment method not in ['stripe', 'yape', 'plin'] |
| 400 | Payment method not enabled | Selected payment method is disabled in settings |
| 400 | Transaction code required | Missing transactionCode for yape/plin |
| 400 | Insufficient stock | Product stock is less than requested quantity |
| 404 | Product not found | One or more products don't exist or are inactive |
| 500 | Internal server error | Database or server error |

#### Example Request

```bash
curl -X POST "https://likethem.com/api/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "items": [
      {
        "productId": "clx123abc",
        "quantity": 2,
        "size": "M",
        "color": "Blue",
        "curatorId": "clx456def"
      },
      {
        "productId": "clx789ghi",
        "quantity": 1,
        "curatorId": "clx101jkl"
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
  }'
```

#### Example Response

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
      "createdAt": "2024-01-30T12:00:00Z",
      "items": [...],
      "shippingAddress": {...}
    },
    {
      "id": "clx222ccc",
      "buyerId": "clx222bbb",
      "curatorId": "clx101jkl",
      "status": "PENDING",
      "totalAmount": 79.99,
      "commission": 7.99,
      "curatorAmount": 72.00,
      "paymentMethod": "stripe",
      "createdAt": "2024-01-30T12:00:00Z",
      "items": [...],
      "shippingAddress": {...}
    }
  ],
  "message": "2 order(s) created successfully"
}
```

## Business Logic

### Multi-Curator Order Handling

When a cart contains items from multiple curators, the system automatically:

1. **Groups items by curator** - All items from the same curator are grouped together
2. **Creates separate orders** - One order per curator
3. **Applies individual commission** - Each order has its own commission calculation
4. **Uses same shipping address** - All orders share the same shipping details
5. **Returns all orders** - Client receives array of all created orders

### Commission Calculation

Commission is calculated based on the `commissionRate` from PaymentSettings:

```typescript
subtotal = sum(item.price * item.quantity) for all items
commission = subtotal * commissionRate
curatorAmount = subtotal - commission
```

**Example** (10% commission rate):
- Product price: $50
- Quantity: 3
- Subtotal: $150
- Commission: $15 (10% of $150)
- Curator receives: $135

### Stock Management

Stock is updated atomically within a database transaction:

1. Validate all products have sufficient stock
2. Create all orders
3. Decrement stock for each product
4. If any step fails, entire transaction is rolled back

This ensures stock consistency and prevents overselling.

### Payment Method Validation

Before order creation, the system validates:

1. Payment method is one of: `stripe`, `yape`, `plin`
2. Payment method is enabled in PaymentSettings
3. For yape/plin: transaction code is provided
4. Payment settings exist in database

## Database Schema

### Order Model

```prisma
model Order {
  id                    String   @id @default(cuid())
  buyerId               String
  curatorId             String
  status                String   @default("PENDING")
  totalAmount           Float
  commission            Float
  curatorAmount         Float
  paymentMethod         String?
  transactionCode       String?
  paymentProof          String?
  stripePaymentIntentId String?
  stripeTransferId      String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  items           OrderItem[]
  shippingAddress ShippingAddress?
  buyer           User             @relation("BuyerOrders")
  curator         CuratorProfile   @relation("CuratorOrders")
}
```

### OrderItem Model

```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  size      String?
  color     String?
  
  order   Order   @relation(...)
  product Product @relation(...)
}
```

### ShippingAddress Model

```prisma
model ShippingAddress {
  id      String  @id @default(cuid())
  orderId String  @unique
  name    String
  email   String
  phone   String?
  address String
  city    String
  state   String
  zipCode String
  country String
  
  order Order @relation(...)
}
```

## TypeScript Types

All types are defined in `/types/order.ts`:

```typescript
import { 
  CreateOrderRequest, 
  CreateOrderResponse, 
  Order, 
  OrderItem,
  ShippingAddress 
} from '@/types/order';
```

## Error Handling

All errors are caught and returned with appropriate status codes:

```typescript
try {
  // Order creation logic
} catch (error) {
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## Testing

### Manual Testing with cURL

**Create Order:**
```bash
# 1. Authenticate and get session cookie
# 2. Create order
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d @order-payload.json
```

**List Orders:**
```bash
curl -X GET "http://localhost:3000/api/orders?page=1&limit=10" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Test Cases

1. ✅ Create order with single curator items
2. ✅ Create multiple orders with multi-curator items
3. ✅ Validate payment method is enabled
4. ✅ Validate transaction code for yape/plin
5. ✅ Validate product stock sufficiency
6. ✅ Validate shipping address completeness
7. ✅ Handle insufficient stock gracefully
8. ✅ Handle product not found
9. ✅ Handle unauthorized access
10. ✅ Atomic stock updates (transaction rollback)

## Next Steps

### Stripe Integration
- [ ] Create Stripe PaymentIntent in order creation
- [ ] Add webhook handler for payment confirmation
- [ ] Update order status on successful payment

### Order Management
- [ ] Add PATCH endpoint for order status updates (admin/curator)
- [ ] Add GET `/api/orders/:id` for single order details
- [ ] Add order cancellation endpoint
- [ ] Add order refund endpoint

### Notifications
- [ ] Email notifications to buyer on order creation
- [ ] Email notifications to curator on new order
- [ ] Email notifications on status changes
- [ ] Admin notifications for pending verification (yape/plin)

## Security Considerations

1. **Authentication**: All endpoints require user authentication
2. **Authorization**: Users can only access their own orders
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection**: Using Prisma ORM prevents SQL injection
5. **Transaction Safety**: Stock updates use database transactions
6. **Payment Validation**: Payment methods validated against settings

## Performance

- **Database Queries**: Optimized with `include` and `select` clauses
- **Pagination**: GET endpoint supports pagination
- **Transactions**: Order creation uses single transaction for atomicity
- **Connection Pool**: Prisma handles connection pooling automatically

---

**Last Updated**: January 30, 2024  
**Version**: 1.0.0
