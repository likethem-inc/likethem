# Order Creation Bug Analysis & Fix

## 🔍 Issue Summary

**Problem**: When users complete checkout, order creation fails instead of creating orders in the database.

**Impact**:
- Orders are not created
- Orders don't appear in "mis ordenes" (buyer view at `/orders`)
- Orders don't appear in "gestor de ordenes" (curator view at `/dashboard/curator/orders`)
- No curator notifications are triggered

---

## 🐛 Root Cause Analysis

### The Bug: Wrong Product ID Mapping

**Location**: `app/checkout/page.tsx` - Line 290

**Current (Incorrect) Code**:
```typescript
const orderData = {
  items: items.map(item => {
    const product = item.productId ? productsDetails.get(item.productId) : null
    return {
      productId: item.id,  // ❌ BUG: Uses cart item ID instead of product ID
      quantity: item.quantity,
      size: item.size || undefined,
      color: item.color || undefined,
      curatorId: product?.curatorId || curatorId || 'default'
    }
  }),
  // ...
}
```

### Why This Fails

1. **Cart Item Structure** (from `contexts/CartContext.tsx`):
   ```typescript
   interface CartItem {
     id: string           // Cart item ID (e.g., "clxyz123abc")
     name: string
     curator: string
     price: number
     quantity: number
     image: string
     size?: string
     color?: string
     productId?: string   // ← Actual product ID (e.g., "product-456def")
   }
   ```

2. **What Happens**:
   - Checkout sends `item.id` (cart item ID) as `productId`
   - API endpoint `/api/orders/route.ts` tries to find product with cart item ID
   - At line 142-146, API validates products:
     ```typescript
     const products = await prisma.product.findMany({
       where: {
         id: { in: productIds },  // Looks for cart IDs, not product IDs
         isActive: true
       },
       // ...
     });
     ```
   - Products are not found → Error 404: "Products not found or inactive"
   - Order creation fails

---

## 🔧 The Fix

### Change Required

**File**: `app/checkout/page.tsx`  
**Line**: 290

**From**:
```typescript
productId: item.id,
```

**To**:
```typescript
productId: item.productId,
```

### Complete Fixed Code Block

```typescript
const orderData = {
  items: items.map(item => {
    const product = item.productId ? productsDetails.get(item.productId) : null
    return {
      productId: item.productId,  // ✅ FIXED: Use actual product ID
      quantity: item.quantity,
      size: item.size || undefined,
      color: item.color || undefined,
      curatorId: product?.curatorId || curatorId || 'default'
    }
  }),
  shippingAddress: {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    country: formData.country
  },
  paymentMethod,
  transactionCode: transactionCode || undefined,
  paymentProof: null
}
```

---

## 📋 Order Flow Architecture

### 1. Checkout Component (`app/checkout/page.tsx`)

**Purpose**: Collect user information and submit order

**Key Functions**:
- Fetches cart items from `CartContext`
- Loads product details to get curator information
- Fetches curator-specific payment methods
- Handles payment proof upload
- Submits order to `/api/orders` endpoint

**Current Issues**:
- ❌ Wrong productId mapping (line 290)
- ✅ Properly groups items by curator
- ✅ Validates payment methods
- ✅ Handles shipping address

### 2. Order Creation API (`app/api/orders/route.ts`)

**Purpose**: Create orders in database

**Flow**:
1. Authenticates user (lines 68-71)
2. Validates request body (lines 84-138)
3. Validates payment method is enabled (lines 108-130)
4. Validates products exist and are active (lines 141-165)
5. Checks stock availability (lines 170-186)
6. Groups items by curator (lines 189-202)
7. Creates orders in transaction (lines 205-301)
8. Updates product stock (lines 286-295)

**What Works**:
- ✅ Proper validation
- ✅ Multi-curator order splitting
- ✅ Commission calculation
- ✅ Stock management
- ✅ Transaction safety

**What's Missing**:
- ❌ No notification system for curators
- ❌ No email notifications

### 3. Buyer Orders View (`app/orders/page.tsx`)

**Purpose**: Display user's orders ("mis ordenes")

**Features**:
- ✅ Fetches orders for authenticated user
- ✅ Shows order items with product images
- ✅ Displays shipping address
- ✅ Includes pagination
- ✅ Shows empty state

**What Works**:
- Once orders are created, this page will display them correctly

### 4. Curator Orders View (`app/dashboard/curator/orders/page.tsx`)

**Purpose**: Display curator's orders ("gestor de ordenes")

**Features**:
- ✅ Fetches orders for curator's products
- ✅ Filters by status (ALL, PENDING_PAYMENT, PAID, REJECTED, CONFIRMED)
- ✅ Shows payment proofs
- ✅ Allows status updates (Mark as Paid, Reject)
- ✅ Displays order details modal
- ✅ Shows statistics

**Current Issues**:
- The API endpoint `/api/orders` only fetches buyer's orders (line 23)
- Need to check if curator orders endpoint exists

---

## 🔔 Notification System Analysis

### Current State

**What Exists**:
- ✅ Email notification system (`lib/mailer.ts`)
- ✅ Used for curator applications
- ✅ Used for admin actions

**What's Missing**:
- ❌ No notification table in database
- ❌ No in-app notification system
- ❌ No curator notification on new orders
- ❌ No email notification on new orders

### Notification Schema (Not Implemented)

Currently, there is **NO** notification model in the Prisma schema. To implement notifications, you would need:

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // 'ORDER', 'PAYMENT', 'MESSAGE'
  title     String
  message   String
  data      Json?    // Additional data (order ID, etc.)
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  
  @@map("notifications")
}
```

### Where to Add Notifications

**In Order Creation** (`app/api/orders/route.ts` - after line 301):
```typescript
// After orders are created successfully
for (const order of createdOrders) {
  // Create notification for curator
  await tx.notification.create({
    data: {
      userId: order.curator.userId,
      type: 'NEW_ORDER',
      title: 'New Order Received',
      message: `You have a new order #${order.id.slice(-8)} for $${order.totalAmount}`,
      data: {
        orderId: order.id,
        amount: order.totalAmount
      }
    }
  });
  
  // Send email notification (optional)
  await sendOrderNotificationEmail(order.curator.email, order);
}
```

---

## 🔄 Complete Order Lifecycle

### 1. User Adds Items to Cart
- `components/cart/AddToCartButton.tsx` → Adds to cart
- `contexts/CartContext.tsx` → Manages cart state
- `app/api/cart/route.ts` → Persists to database

### 2. User Goes to Checkout
- `app/checkout/page.tsx` → Checkout form
- Fetches product details
- Loads curator payment methods
- Validates cart items

### 3. User Submits Order
- **Frontend** (`app/checkout/page.tsx`):
  - Uploads payment proof (if provided)
  - Prepares order data
  - **BUG HERE**: Wrong productId mapping
  - Calls POST `/api/orders`

- **Backend** (`app/api/orders/route.ts`):
  - Validates data
  - Checks product availability
  - Creates orders (split by curator)
  - Updates stock
  - **MISSING**: Create notifications

### 4. Order Appears in Views
- **Buyer**: `/orders` - Shows all orders for buyer
- **Curator**: `/dashboard/curator/orders` - Shows orders for curator's products

### 5. Curator Manages Order
- Views order details
- Checks payment proof
- Updates status (PAID, REJECTED, CONFIRMED)
- Fulfills order

---

## 🛠️ Additional Issues Found

### 1. Curator Orders API Endpoint

**Issue**: The curator orders page (`app/dashboard/curator/orders/page.tsx`) fetches from `/api/orders`, but that endpoint only returns buyer's orders.

**Location**: Line 51 in `app/dashboard/curator/orders/page.tsx`
```typescript
const response = await fetch('/api/orders', {
  credentials: 'include'
})
```

**Problem**: The GET method in `/api/orders/route.ts` (lines 11-62) only fetches orders where `buyerId: user.id`.

**Fix Needed**: The API should detect if the user is a curator and return curator's orders instead:
```typescript
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;
    
    // Check if user is a curator
    const curatorProfile = await prisma.curatorProfile.findFirst({
      where: { userId: user.id }
    });

    let whereClause = {};
    
    if (curatorProfile && searchParams.get('view') === 'curator') {
      // Return curator's orders
      whereClause = { curatorId: curatorProfile.id };
    } else {
      // Return buyer's orders
      whereClause = { buyerId: user.id };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip, 
        take: limit,
        include: {
          items: {
            include: { 
              product: { 
                select: { 
                  id: true, 
                  title: true, 
                  images: {
                    select: { url: true, altText: true },
                    take: 1,
                    orderBy: { order: 'asc' }
                  }
                } 
              } 
            },
          },
          shippingAddress: true,
          buyer: {
            select: {
              name: true,
              email: true
            }
          }
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      page, 
      limit, 
      total, 
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
```

And update the curator orders page to add the query parameter:
```typescript
const response = await fetch('/api/orders?view=curator', {
  credentials: 'include'
})
```

---

## ✅ Action Items

### Immediate (Critical - Blocks Order Creation)
1. **Fix productId mapping** in `app/checkout/page.tsx` line 290
   - Change from `item.id` to `item.productId`
   - Test order creation flow

### High Priority (Orders Won't Display for Curators)
2. **Fix curator orders API** in `/api/orders/route.ts`
   - Add logic to detect curator vs buyer view
   - Update curator orders page to use query parameter
   - Test curator order display

### Medium Priority (Better UX)
3. **Add curator order notifications**
   - Create notification model in Prisma schema
   - Add notification creation in order API
   - Display notifications in curator dashboard
   - Add real-time updates (optional)

4. **Add email notifications**
   - Email curator on new order
   - Email buyer on order status changes
   - Use existing `lib/mailer.ts`

### Low Priority (Nice to Have)
5. **Add order status tracking**
   - Add tracking number field
   - Add shipping status updates
   - Show order timeline

6. **Add order analytics**
   - Revenue charts
   - Order trends
   - Best-selling products

---

## 🧪 Testing Checklist

### After Fixing productId Bug
- [ ] Add product to cart
- [ ] Go to checkout
- [ ] Fill shipping information
- [ ] Select payment method
- [ ] Submit order
- [ ] Verify order created in database
- [ ] Check `/orders` page shows order
- [ ] Check order details page works

### After Fixing Curator Orders
- [ ] Login as curator
- [ ] Go to `/dashboard/curator/orders`
- [ ] Verify orders display
- [ ] Test filtering by status
- [ ] Test order status updates
- [ ] Test order details modal

### After Adding Notifications
- [ ] Create order as buyer
- [ ] Check curator receives notification
- [ ] Check notification appears in dashboard
- [ ] Test marking notification as read
- [ ] Test email notification (if implemented)

---

## 📝 Summary

**Critical Bug**: Line 290 in `app/checkout/page.tsx` sends cart item ID instead of product ID, causing all orders to fail.

**Fix**: Change `productId: item.id` to `productId: item.productId`

**Additional Issues**:
- Curator orders page doesn't work (fetches wrong data)
- No notification system implemented
- No email notifications

**Impact After Fix**:
- ✅ Orders will be created successfully
- ✅ Orders will appear in buyer's "mis ordenes"
- ❌ Orders still won't appear in curator's "gestor de ordenes" (needs curator API fix)
- ❌ No notifications yet (needs notification system implementation)
