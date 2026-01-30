# Payment Methods Configuration - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          LIKETHEM PLATFORM                           │
│                   Payment Methods Configuration                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         1. ADMIN INTERFACE                           │
└─────────────────────────────────────────────────────────────────────┘

    /admin/settings
    ┌────────────────────────────────────────────┐
    │   Payment Settings Admin Panel             │
    │                                            │
    │   ┌──────────────────────────────────┐   │
    │   │  Yape Configuration              │   │
    │   │  [x] Enable Yape                 │   │
    │   │  Phone: +51 999 888 777          │   │
    │   │  QR Code: [Upload]               │   │
    │   │  Instructions: [Text area]       │   │
    │   └──────────────────────────────────┘   │
    │                                            │
    │   ┌──────────────────────────────────┐   │
    │   │  Plin Configuration              │   │
    │   │  [x] Enable Plin                 │   │
    │   │  Phone: +51 999 888 777          │   │
    │   │  QR Code: [Upload]               │   │
    │   │  Instructions: [Text area]       │   │
    │   └──────────────────────────────────┘   │
    │                                            │
    │   ┌──────────────────────────────────┐   │
    │   │  Stripe Configuration            │   │
    │   │  [x] Enable Stripe               │   │
    │   │  Public Key: pk_...              │   │
    │   │  Secret Key: sk_...              │   │
    │   └──────────────────────────────────┘   │
    │                                            │
    │           [Save Settings]                  │
    └────────────────────────────────────────────┘
                    │
                    │ PUT /api/admin/payment-settings
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                        2. ADMIN API LAYER                            │
└─────────────────────────────────────────────────────────────────────┘

    /api/admin/payment-settings
    ┌────────────────────────────────────────────┐
    │  Auth Middleware                           │
    │  • Check user session                      │
    │  • Verify ADMIN role                       │
    │  • Return 403 if unauthorized              │
    └────────────────────────────────────────────┘
                    │
                    ▼
    ┌────────────────────────────────────────────┐
    │  Payment Settings Controller               │
    │  • GET: Fetch current settings             │
    │  • PUT: Update settings                    │
    │  • Validate input data                     │
    └────────────────────────────────────────────┘
                    │
                    ▼
    /api/admin/payment-settings/upload-qr
    ┌────────────────────────────────────────────┐
    │  QR Code Upload Handler                    │
    │  • Validate file type/size                 │
    │  • Upload to Supabase Storage              │
    │  • Return public URL                       │
    └────────────────────────────────────────────┘
                    │
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                      3. SUPABASE STORAGE                             │
└─────────────────────────────────────────────────────────────────────┘

    Bucket: likethem-assets
    ┌────────────────────────────────────────────┐
    │  /payment-qr-codes/                        │
    │    ├── 1234567890-abc123.png (Yape QR)    │
    │    └── 1234567891-def456.png (Plin QR)    │
    │                                            │
    │  /payment-proofs/                          │
    │    └── 1234567892-ghi789.jpg (Buyer)      │
    └────────────────────────────────────────────┘
                    │
                    │ Public URLs
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       4. DATABASE (PostgreSQL)                       │
└─────────────────────────────────────────────────────────────────────┘

    Table: payment_settings
    ┌────────────────────────────────────────────────────────────────┐
    │ id              │ String (CUID)                                │
    │ yapeEnabled     │ Boolean (false)                              │
    │ yapePhoneNumber │ String (+51 999 888 777)                     │
    │ yapeQRCode      │ String (https://supabase.../yape-qr.png)     │
    │ yapeInstructions│ String (Scan QR code...)                     │
    │ plinEnabled     │ Boolean (false)                              │
    │ plinPhoneNumber │ String (+51 999 888 777)                     │
    │ plinQRCode      │ String (https://supabase.../plin-qr.png)     │
    │ plinInstructions│ String (Scan QR code...)                     │
    │ stripeEnabled   │ Boolean (true)                               │
    │ stripePublicKey │ String (pk_...)                              │
    │ stripeSecretKey │ String (sk_...)                              │
    │ defaultMethod   │ String (stripe)                              │
    │ commissionRate  │ Float (0.10)                                 │
    │ updatedAt       │ DateTime                                     │
    │ updatedBy       │ String (Admin User ID)                       │
    └────────────────────────────────────────────────────────────────┘
                    │
                    │ Query
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                        5. PUBLIC API LAYER                           │
└─────────────────────────────────────────────────────────────────────┘

    /api/payment-methods (Public Endpoint)
    ┌────────────────────────────────────────────┐
    │  Payment Methods Provider                  │
    │  • Fetch PaymentSettings from DB           │
    │  • Filter only enabled methods             │
    │  • Return sanitized public data            │
    │  • No auth required                        │
    └────────────────────────────────────────────┘
                    │
                    │ GET
                    ▼
    Response:
    {
      "methods": {
        "yape": {
          "enabled": true,
          "phoneNumber": "+51 999 888 777",
          "qrCodeUrl": "https://...",
          "instructions": "Scan QR..."
        },
        "plin": { ... },
        "stripe": { ... }
      },
      "defaultMethod": "stripe"
    }
                    │
                    │ Consumed by
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       6. BUYER CHECKOUT FLOW                         │
└─────────────────────────────────────────────────────────────────────┘

    /checkout
    ┌────────────────────────────────────────────┐
    │  Checkout Page                             │
    │                                            │
    │  1. Fetch Payment Methods on Mount         │
    │     ↓                                      │
    │  2. Display Only Enabled Methods           │
    │     ┌──────────────────────────────┐      │
    │     │ ○ Credit Card (Stripe)        │      │
    │     │ ○ Yape (enabled)              │      │
    │     │ ○ Plin (enabled)              │      │
    │     └──────────────────────────────┘      │
    │     ↓                                      │
    │  3. If Yape/Plin Selected                  │
    │     ┌──────────────────────────────┐      │
    │     │ [QR Code Image]              │      │
    │     │ Phone: +51 999 888 777       │      │
    │     │ Instructions: ...            │      │
    │     │ Transaction Code: [____]     │      │
    │     │ Upload Proof: [Browse]       │      │
    │     └──────────────────────────────┘      │
    │     ↓                                      │
    │  4. Submit Order                           │
    │     [Place Order] ───────────┐            │
    └──────────────────────────────│────────────┘
                                   │
                                   │ POST /api/orders
                                   ▼

┌─────────────────────────────────────────────────────────────────────┐
│                      7. ORDER CREATION API                           │
└─────────────────────────────────────────────────────────────────────┘

    /api/orders (POST)
    ┌────────────────────────────────────────────┐
    │  Order Creation Handler                    │
    │                                            │
    │  1. Validate user authentication           │
    │  2. Check payment method is enabled        │
    │  3. Validate cart items & stock            │
    │  4. Calculate totals & commission          │
    │  5. Upload payment proof (if provided)     │
    │  6. Create Order + OrderItems              │
    │  7. Create ShippingAddress                 │
    │  8. Set status:                            │
    │     • Stripe → PENDING                     │
    │     • Yape/Plin → PENDING_VERIFICATION     │
    │  9. Return order confirmation              │
    └────────────────────────────────────────────┘
                    │
                    │ Prisma Create
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                       8. ORDER STORAGE                               │
└─────────────────────────────────────────────────────────────────────┘

    Table: orders
    ┌────────────────────────────────────────────────────────────────┐
    │ id              │ String (CUID)                                │
    │ buyerId         │ String (User ID)                             │
    │ curatorId       │ String (Curator ID)                          │
    │ status          │ String (PENDING_VERIFICATION)                │
    │ totalAmount     │ Float (150.00)                               │
    │ commission      │ Float (15.00)                                │
    │ curatorAmount   │ Float (135.00)                               │
    │ paymentMethod   │ String (yape)                                │
    │ transactionCode │ String (12345678)                            │
    │ paymentProof    │ String (https://supabase.../proof.jpg)       │
    │ createdAt       │ DateTime                                     │
    └────────────────────────────────────────────────────────────────┘

    Table: order_items
    ┌────────────────────────────────────────────────────────────────┐
    │ id        │ productId │ quantity │ price │ size │ color        │
    └────────────────────────────────────────────────────────────────┘

    Table: shipping_addresses
    ┌────────────────────────────────────────────────────────────────┐
    │ orderId   │ name │ email │ phone │ address │ city │ ...        │
    └────────────────────────────────────────────────────────────────┘
                    │
                    │ Order Created
                    ▼

┌─────────────────────────────────────────────────────────────────────┐
│                    9. ORDER VERIFICATION (Admin)                     │
└─────────────────────────────────────────────────────────────────────┘

    /admin/orders (Future Enhancement)
    ┌────────────────────────────────────────────┐
    │  Orders Awaiting Verification              │
    │                                            │
    │  ┌──────────────────────────────────────┐ │
    │  │ Order #12345                         │ │
    │  │ Payment Method: Yape                 │ │
    │  │ Amount: $150.00                      │ │
    │  │ Transaction Code: 12345678           │ │
    │  │ Payment Proof: [View Image]          │ │
    │  │                                      │ │
    │  │ [Approve] [Reject]                   │ │
    │  └──────────────────────────────────────┘ │
    └────────────────────────────────────────────┘
                    │
                    │ Update Order Status
                    ▼
    Order Status: CONFIRMED or REJECTED

═══════════════════════════════════════════════════════════════════════

                          DATA FLOW SUMMARY

1. Admin configures payment settings via UI
2. Settings stored in PostgreSQL database
3. QR codes uploaded to Supabase Storage
4. Public API exposes enabled payment methods
5. Checkout page fetches and displays payment options
6. Buyer selects method and completes purchase
7. Order created with payment details
8. Manual payments await admin verification
9. Admin reviews and approves/rejects order

═══════════════════════════════════════════════════════════════════════

                         SECURITY LAYERS

┌─────────────────────────────────────────────────────────────────────┐
│  Layer 1: NextAuth Session                                          │
│  • JWT-based authentication                                          │
│  • Role-based access control (ADMIN, CURATOR, BUYER)                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Layer 2: API Route Protection                                      │
│  • Admin routes check for ADMIN role                                │
│  • User routes check for authenticated session                      │
│  • Public routes have no restrictions                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Layer 3: Database RLS (Prisma)                                     │
│  • User can only access their own orders                            │
│  • Admin can access all records                                     │
│  • Curator can access their store data                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  Layer 4: File Storage                                              │
│  • QR codes: Public (needed for checkout)                           │
│  • Payment proofs: Authenticated access only                        │
│  • File validation: Type, size, malware scan                        │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════

                        TECHNOLOGY STACK

┌──────────────────────┬──────────────────────────────────────────────┐
│ Component            │ Technology                                   │
├──────────────────────┼──────────────────────────────────────────────┤
│ Frontend Framework   │ Next.js 14 (App Router)                      │
│ Language             │ TypeScript                                   │
│ Styling              │ Tailwind CSS                                 │
│ Animations           │ Framer Motion                                │
│ Database             │ PostgreSQL (via Supabase/Neon)               │
│ ORM                  │ Prisma 6.12.0                                │
│ File Storage         │ Supabase Storage                             │
│ Authentication       │ NextAuth.js v4                               │
│ Image Optimization   │ Next.js Image + Supabase                     │
│ API Architecture     │ REST (Next.js API Routes)                    │
│ Deployment           │ Vercel                                       │
└──────────────────────┴──────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
```

## Key Integration Points

### 1. Admin → Database
- **Route**: `PUT /api/admin/payment-settings`
- **Auth**: Admin role required
- **Data**: Payment method configuration

### 2. Admin → Storage
- **Route**: `POST /api/admin/payment-settings/upload-qr`
- **Auth**: Admin role required
- **Data**: QR code images

### 3. Database → Public API
- **Route**: `GET /api/payment-methods`
- **Auth**: None (public)
- **Data**: Enabled payment methods only

### 4. Checkout → Public API
- **Action**: Fetch on component mount
- **Method**: `useEffect` with fetch
- **Data**: Payment method configuration

### 5. Checkout → Order Creation
- **Route**: `POST /api/orders`
- **Auth**: Authenticated user
- **Data**: Order details + payment info

### 6. Order Creation → Storage
- **Action**: Upload payment proof
- **Route**: `POST /api/upload`
- **Folder**: `payment-proofs/`

---

## State Management Flow

```
Admin Settings State → API → Database → Public API → Checkout State

Admin UI State:
- settings (PaymentSettings)
- yapeQRFile (File | null)
- plinQRFile (File | null)
- yapeQRPreview (string | null)
- plinQRPreview (string | null)
- isSaving (boolean)
- showSuccess (boolean)
- error (string | null)

Checkout State:
- paymentMethod (string)
- paymentMethods (PaymentMethodsData | null)
- isLoadingPaymentMethods (boolean)
- paymentProof (File | null)
- transactionCode (string)
```

---

## Error Handling Strategy

```
Admin UI:
├── Fetch Failure → Show error alert
├── Upload Failure → Show error + keep form data
├── Save Failure → Show error + retry option
└── Network Error → Show offline message

Checkout:
├── API Unavailable → Show fallback (all methods disabled)
├── Upload Failure → Allow retry
├── Order Creation Failure → Show error + keep cart
└── Network Error → Show offline message + save draft

Order API:
├── Invalid Payment Method → 400 Bad Request
├── Disabled Payment Method → 400 Bad Request
├── Out of Stock → 400 Bad Request
├── Auth Failure → 401 Unauthorized
└── Server Error → 500 Internal Server Error
```

---

**End of Architecture Diagram**
