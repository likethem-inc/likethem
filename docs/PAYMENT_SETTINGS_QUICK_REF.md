# Payment Settings Backend - Quick Reference

## 📁 Files Created

```
app/api/
├── admin/
│   └── payment-settings/
│       ├── route.ts                 # GET & PUT payment settings
│       └── upload-qr/
│           └── route.ts            # POST QR code upload
└── payment-methods/
    └── route.ts                     # GET public payment methods

docs/
└── PAYMENT_SETTINGS_API.md          # Complete API documentation

scripts/
└── test-payment-api.js              # API test suite
```

## 🚀 Quick Start

### Testing the APIs

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test public endpoint (no auth required):**
   ```bash
   curl http://localhost:3000/api/payment-methods
   ```

3. **Test admin endpoints (requires admin session token):**
   ```bash
   # Get your session token from browser cookies
   # Then run the test script:
   node scripts/test-payment-api.js YOUR_SESSION_TOKEN
   ```

## 🔌 API Endpoints

### 1. Admin Get Settings
```typescript
GET /api/admin/payment-settings
Auth: Required (Admin)
Returns: Current payment settings
```

### 2. Admin Update Settings
```typescript
PUT /api/admin/payment-settings
Auth: Required (Admin)
Body: { yapeEnabled, yapePhoneNumber, ... }
Returns: Updated settings
```

### 3. Upload QR Code
```typescript
POST /api/admin/payment-settings/upload-qr
Auth: Required (Admin)
Body: FormData { file, paymentMethod }
Returns: Uploaded URL + updated settings
```

### 4. Public Payment Methods
```typescript
GET /api/payment-methods
Auth: None (Public)
Returns: List of enabled payment methods
```

## 💡 Usage Examples

### Frontend: Fetch Public Payment Methods
```typescript
const fetchPaymentMethods = async () => {
  const res = await fetch('/api/payment-methods')
  const { methods, defaultMethod, commissionRate } = await res.json()
  return { methods, defaultMethod, commissionRate }
}
```

### Frontend: Update Settings (Admin)
```typescript
const updateSettings = async (settings) => {
  const res = await fetch('/api/admin/payment-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  })
  return res.json()
}
```

### Frontend: Upload QR Code (Admin)
```typescript
const uploadQRCode = async (file: File, paymentMethod: 'yape' | 'plin') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('paymentMethod', paymentMethod)
  
  const res = await fetch('/api/admin/payment-settings/upload-qr', {
    method: 'POST',
    body: formData
  })
  return res.json()
}
```

## 🗄️ Database

The endpoints use the `PaymentSettings` Prisma model:

```prisma
model PaymentSettings {
  id                    String   @id @default(cuid())
  yapeEnabled           Boolean  @default(false)
  yapePhoneNumber       String?
  yapeQRCode            String?
  yapeInstructions      String?
  plinEnabled           Boolean  @default(false)
  plinPhoneNumber       String?
  plinQRCode            String?
  plinInstructions      String?
  stripeEnabled         Boolean  @default(true)
  defaultPaymentMethod  String   @default("stripe")
  commissionRate        Float    @default(0.10)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  updatedBy             String?
}
```

## 🔐 Authentication

### Admin Endpoints
- Uses NextAuth session authentication
- Requires ADMIN role
- Pattern:
  ```typescript
  const user = await getApiUser(request)
  requireApiRole(user, 'ADMIN')
  ```

### Public Endpoint
- No authentication required
- Safe defaults on error
- Never fails completely

## ✅ Validation Rules

1. **Phone Numbers:**
   - Required when payment method is enabled
   - Example: `+51987654321`

2. **Commission Rate:**
   - Must be between 0 and 1
   - Stored as decimal (0.10 = 10%)

3. **Default Payment Method:**
   - Must be one of: `'stripe'`, `'yape'`, `'plin'`

4. **QR Code Upload:**
   - Max file size: 5MB
   - Must be image type
   - Payment method: `'yape'` or `'plin'`

## 📦 Storage

QR codes are stored in Supabase:
- **Bucket:** `likethem-assets`
- **Folder:** `qrs`
- **Naming:** `{timestamp}-{random}.{ext}`
- **Access:** Public URLs

## 🧪 Testing

### Manual Testing
```bash
# 1. Test public endpoint
curl http://localhost:3000/api/payment-methods

# 2. Test admin get (with session token)
curl -X GET http://localhost:3000/api/admin/payment-settings \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 3. Test admin update
curl -X PUT http://localhost:3000/api/admin/payment-settings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"yapeEnabled": true, "yapePhoneNumber": "+51987654321"}'

# 4. Test QR upload
curl -X POST http://localhost:3000/api/admin/payment-settings/upload-qr \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -F "file=@qr.png" \
  -F "paymentMethod=yape"
```

### Automated Testing
```bash
# Run test suite (requires session token for admin tests)
node scripts/test-payment-api.js YOUR_SESSION_TOKEN

# Run only public tests
node scripts/test-payment-api.js
```

## 🐛 Common Issues

### 1. Supabase Upload Fails
- **Check:** Environment variables are set
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Check:** Bucket `likethem-assets` exists
- **Check:** File size ≤ 5MB

### 2. Authentication Fails
- **Check:** User is logged in
- **Check:** User has ADMIN role
- **Check:** Session token is valid

### 3. Validation Errors
- **Check:** Required fields when enabling methods
- **Check:** Commission rate is 0-1
- **Check:** Payment method is valid

## 📚 Documentation

For complete API documentation, see:
- [PAYMENT_SETTINGS_API.md](../docs/PAYMENT_SETTINGS_API.md)

## 🔄 Integration with Frontend

The backend is ready to integrate with:
1. **Admin Dashboard:** Payment settings management page
2. **Checkout Flow:** Display enabled payment methods
3. **Order Processing:** Handle different payment types

Next steps for frontend integration:
1. Create admin UI for settings management
2. Create QR upload component
3. Update checkout to display payment methods
4. Handle payment proof upload for Yape/Plin

## 📝 Notes

- System maintains single PaymentSettings record (latest)
- Auto-creates default settings if none exist
- Public endpoint never fails (returns safe defaults)
- All admin operations are audited (updatedBy field)
- QR codes persist in Supabase Storage
- Commission rate affects order calculations

---

**Created:** 2024
**Author:** likethem-creator agent
**Version:** 1.0.0
