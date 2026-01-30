# Quick Start: Payment Methods Configuration Feature

## 📖 Overview

This document provides a quick reference to implement the payment methods configuration feature for Yape and Plin in the LikeThem platform.

For detailed information, see:
- **Full Repository Overview**: `REPOSITORY_OVERVIEW.md`
- **Complete Implementation Guide**: `PAYMENT_METHODS_IMPLEMENTATION_GUIDE.md`

---

## 🎯 What We're Building

A system that allows admins to configure payment methods (Yape, Plin, Stripe) with:
- Enable/disable toggles for each method
- Phone numbers for Yape/Plin
- QR code uploads
- Custom instructions for buyers
- Dynamic display in checkout based on configuration

---

## 🏗️ Architecture Summary

```
Admin Settings (UI)
     ↓
Admin API (/api/admin/payment-settings)
     ↓
Database (PaymentSettings table)
     ↓
Public API (/api/payment-methods)
     ↓
Checkout Page (Dynamic rendering)
     ↓
Order Creation (/api/orders)
```

---

## 📝 Implementation Checklist

### Step 1: Database Schema (30 min)

```bash
# 1. Add PaymentSettings model to prisma/schema.prisma
# 2. Run migration
npx prisma migrate dev --name add_payment_settings
npx prisma generate

# 3. Seed initial settings (optional)
npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-payment-settings.ts
```

**Files to create/modify**:
- ✏️ `prisma/schema.prisma` - Add PaymentSettings model
- ➕ `prisma/seed-payment-settings.ts` - Seed script

---

### Step 2: Admin API Routes (1-2 hours)

Create these API endpoints:

1. **`app/api/admin/payment-settings/route.ts`**
   - `GET` - Fetch settings
   - `PUT` - Update settings
   - Auth: Admin only

2. **`app/api/admin/payment-settings/upload-qr/route.ts`**
   - `POST` - Upload QR code images
   - Uses Supabase Storage
   - Auth: Admin only

**Key functions**:
- Validate admin role
- Handle Prisma operations
- Upload QR codes to `payment-qr-codes/` folder

---

### Step 3: Public API Route (30 min)

**`app/api/payment-methods/route.ts`**
- `GET` - Return enabled payment methods (public endpoint)
- Response includes: phone numbers, QR URLs, instructions
- Only returns enabled methods

---

### Step 4: Admin UI (2-3 hours)

**`app/admin/settings/page.tsx`**

Replace stub implementation with full settings page:

**Sections**:
1. Yape Settings (phone, QR, instructions, enable/disable)
2. Plin Settings (phone, QR, instructions, enable/disable)
3. Stripe Settings (API keys, enable/disable)
4. Global Settings (default method, commission rate)

**Features**:
- QR code upload with preview
- Enable/disable toggles
- Save button with loading state
- Success/error notifications

---

### Step 5: Update Checkout (1 hour)

**`app/checkout/page.tsx`**

**Changes**:
1. Fetch payment methods from `/api/payment-methods` on mount
2. Show only enabled payment methods
3. Display dynamic QR codes and phone numbers (not hardcoded)
4. Use instructions from admin settings

**Key updates**:
- Add `useEffect` to fetch payment methods
- Update payment method radio buttons section
- Use dynamic data in manual payment section

---

### Step 6: Order Creation API (1-2 hours)

**`app/api/orders/route.ts`**

Add `POST` endpoint to existing file:

**Logic**:
1. Validate user authentication
2. Check payment method is enabled
3. Validate cart items and calculate totals
4. Create order with payment data
5. Set status: `PENDING` (Stripe) or `PENDING_VERIFICATION` (Yape/Plin)
6. Create shipping address
7. Return order details

---

### Step 7: Testing (1 hour)

Use this checklist:

**Database**:
- [ ] Migration runs without errors
- [ ] Default settings seeded

**Admin**:
- [ ] Can view current settings
- [ ] Can enable/disable methods
- [ ] Can upload QR codes
- [ ] Can save settings
- [ ] Only admins can access

**Checkout**:
- [ ] Only enabled methods show
- [ ] Correct QR codes display
- [ ] Dynamic phone numbers work
- [ ] Order creates successfully

---

## 🗂️ File Structure

```
likethem/
├── prisma/
│   ├── schema.prisma                              # ✏️ Add PaymentSettings
│   └── seed-payment-settings.ts                   # ➕ New
│
├── app/
│   ├── admin/
│   │   └── settings/
│   │       └── page.tsx                           # ✏️ Replace stub
│   │
│   ├── api/
│   │   ├── admin/
│   │   │   └── payment-settings/
│   │   │       ├── route.ts                       # ➕ New
│   │   │       └── upload-qr/
│   │   │           └── route.ts                   # ➕ New
│   │   │
│   │   ├── payment-methods/
│   │   │   └── route.ts                           # ➕ New
│   │   │
│   │   └── orders/
│   │       └── route.ts                           # ✏️ Add POST
│   │
│   └── checkout/
│       └── page.tsx                               # ✏️ Update
│
└── docs/
    ├── REPOSITORY_OVERVIEW.md                      # 📄 Reference
    ├── PAYMENT_METHODS_IMPLEMENTATION_GUIDE.md     # 📄 Detailed guide
    └── QUICK_START_PAYMENT_FEATURE.md             # 📄 This file
```

**Legend**:
- ✏️ Modify existing file
- ➕ Create new file
- 📄 Documentation

---

## 🔑 Key Code Snippets

### PaymentSettings Model (Prisma)

```prisma
model PaymentSettings {
  id                    String   @id @default(cuid())
  yapeEnabled           Boolean  @default(false)
  yapePhoneNumber       String?
  yapeQRCode            String?
  plinEnabled           Boolean  @default(false)
  plinPhoneNumber       String?
  plinQRCode            String?
  stripeEnabled         Boolean  @default(true)
  defaultPaymentMethod  String   @default("stripe")
  commissionRate        Float    @default(0.10)
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  
  @@map("payment_settings")
}
```

### Fetch Payment Methods (Checkout)

```typescript
const [paymentMethods, setPaymentMethods] = useState(null)

useEffect(() => {
  fetch('/api/payment-methods')
    .then(res => res.json())
    .then(data => {
      setPaymentMethods(data)
      setPaymentMethod(data.defaultMethod)
    })
}, [])
```

### Admin Auth Check

```typescript
const session = await getServerSession(authOptions)

if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json(
    { error: 'Unauthorized - Admin access required' },
    { status: 403 }
  )
}
```

---

## 🧪 Testing Commands

```bash
# Start development server
npm run dev

# Test database connection
npx prisma studio

# Verify Supabase Storage
npm run verify:storage

# Check admin access
# Navigate to: http://localhost:3000/admin/settings

# Test API endpoints
curl http://localhost:3000/api/payment-methods
```

---

## 📊 Current vs. Future State

### Current State (Hardcoded)

```typescript
// Checkout shows all methods with hardcoded values
<img src="/payment-qr/yape-qr.svg" />
<span>+51 999 888 777</span>
```

### Future State (Dynamic)

```typescript
// Checkout fetches enabled methods from API
const methods = await fetch('/api/payment-methods')

{methods.yape?.enabled && (
  <img src={methods.yape.qrCodeUrl} />
  <span>{methods.yape.phoneNumber}</span>
)}
```

---

## 🛠️ Development Tips

1. **Start with Database**: Get schema and migrations working first
2. **Test APIs Separately**: Use Postman or curl before integrating UI
3. **Use Prisma Studio**: Visualize data during development
4. **Check Auth**: Test admin endpoints with non-admin users
5. **Supabase Bucket**: Ensure `likethem-assets` bucket exists
6. **File Upload**: Test QR upload in isolation before full flow

---

## 🚨 Common Issues & Solutions

### Issue: Prisma Client not updated
```bash
npx prisma generate
```

### Issue: Migration fails
```bash
# Check connection
npx prisma db push
# Or reset database (dev only!)
npx prisma migrate reset
```

### Issue: Supabase upload fails
- Check environment variables
- Verify bucket exists and is public
- Run: `npm run verify:storage`

### Issue: Admin page returns 403
- Check user role in database
- Verify session cookie
- Test with: `npm run promote:curator`

---

## 📈 Estimated Timeline

| Phase | Time | Files |
|-------|------|-------|
| 1. Database Setup | 30 min | 2 files |
| 2. Admin API | 1-2 hrs | 2 files |
| 3. Public API | 30 min | 1 file |
| 4. Admin UI | 2-3 hrs | 1 file |
| 5. Checkout Update | 1 hr | 1 file |
| 6. Order API | 1-2 hrs | 1 file |
| 7. Testing | 1 hr | All |
| **Total** | **7-10 hrs** | **8 files** |

---

## 📞 Next Steps

1. **Read this guide** ✅
2. **Review `PAYMENT_METHODS_IMPLEMENTATION_GUIDE.md`** for detailed code
3. **Start with Step 1** (Database Schema)
4. **Follow steps 2-6** sequentially
5. **Test thoroughly** (Step 7)
6. **Deploy** when ready

---

## 🔗 Related Documentation

- `REPOSITORY_OVERVIEW.md` - Full codebase overview
- `PAYMENT_METHODS_IMPLEMENTATION_GUIDE.md` - Complete implementation details
- `SUPABASE_STORAGE_SETUP.md` - Storage configuration
- `DEPLOYMENT_GUIDE.md` - Production deployment

---

**Good luck with the implementation! 🚀**

If you need help with specific code sections, refer to the detailed implementation guide.
