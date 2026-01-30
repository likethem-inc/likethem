# Payment Settings API Documentation

This document describes the backend API endpoints for managing payment settings in the likethem platform.

## Overview

The payment settings API allows administrators to configure payment methods (Yape, Plin, and Stripe) and their associated details like phone numbers, QR codes, and instructions. The public API provides enabled payment methods to the frontend.

## Endpoints

### 1. Admin Payment Settings API

**Base Path:** `/api/admin/payment-settings`

#### GET - Fetch Current Payment Settings

**Authentication:** Required (Admin only)

**Description:** Retrieves the current payment settings configuration. If no settings exist, it automatically creates default settings.

**Request:**
```http
GET /api/admin/payment-settings
Headers:
  - Authentication via NextAuth session
```

**Response (200 OK):**
```json
{
  "settings": {
    "id": "clxxxxx",
    "yapeEnabled": false,
    "yapePhoneNumber": null,
    "yapeQRCode": null,
    "yapeInstructions": "Realiza el pago escaneando el código QR...",
    "plinEnabled": false,
    "plinPhoneNumber": null,
    "plinQRCode": null,
    "plinInstructions": "Realiza el pago escaneando el código QR...",
    "stripeEnabled": true,
    "stripePublicKey": null,
    "stripeSecretKey": null,
    "defaultPaymentMethod": "stripe",
    "commissionRate": 0.10,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "updatedBy": "user_id"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - No authentication
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Server error

---

#### PUT - Update Payment Settings

**Authentication:** Required (Admin only)

**Description:** Updates the payment settings configuration.

**Request:**
```http
PUT /api/admin/payment-settings
Headers:
  - Authentication via NextAuth session
Content-Type: application/json

Body:
{
  "yapeEnabled": true,
  "yapePhoneNumber": "+51987654321",
  "yapeInstructions": "Custom instructions...",
  "plinEnabled": false,
  "plinPhoneNumber": null,
  "plinInstructions": null,
  "stripeEnabled": true,
  "defaultPaymentMethod": "yape",
  "commissionRate": 0.15
}
```

**Request Body Parameters:**
- `yapeEnabled` (boolean, optional): Enable/disable Yape payment method
- `yapePhoneNumber` (string, optional): Yape phone number (required if yapeEnabled is true)
- `yapeInstructions` (string, optional): Custom instructions for Yape payments
- `plinEnabled` (boolean, optional): Enable/disable Plin payment method
- `plinPhoneNumber` (string, optional): Plin phone number (required if plinEnabled is true)
- `plinInstructions` (string, optional): Custom instructions for Plin payments
- `stripeEnabled` (boolean, optional): Enable/disable Stripe payment method
- `defaultPaymentMethod` (string, optional): Default payment method ('stripe', 'yape', or 'plin')
- `commissionRate` (float, optional): Commission rate (0.0 to 1.0)

**Response (200 OK):**
```json
{
  "message": "Payment settings updated successfully",
  "settings": {
    "id": "clxxxxx",
    "yapeEnabled": true,
    "yapePhoneNumber": "+51987654321",
    // ... all settings
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input (e.g., missing phone number when method is enabled)
- `401 Unauthorized` - No authentication
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Server error

**Validation Rules:**
- Yape phone number is required when `yapeEnabled` is true
- Plin phone number is required when `plinEnabled` is true
- Commission rate must be between 0 and 1
- Default payment method must be one of: 'stripe', 'yape', 'plin'

---

### 2. QR Code Upload API

**Base Path:** `/api/admin/payment-settings/upload-qr`

#### POST - Upload QR Code Image

**Authentication:** Required (Admin only)

**Description:** Uploads a QR code image to Supabase Storage and updates the payment settings with the URL.

**Request:**
```http
POST /api/admin/payment-settings/upload-qr
Headers:
  - Authentication via NextAuth session
Content-Type: multipart/form-data

FormData:
  - file: (File) The QR code image file
  - paymentMethod: (string) Either 'yape' or 'plin'
```

**Request Parameters:**
- `file` (File, required): Image file (max 5MB, must be an image type)
- `paymentMethod` (string, required): Payment method ('yape' or 'plin')

**Response (200 OK):**
```json
{
  "message": "QR code uploaded successfully",
  "url": "https://supabase-url/storage/v1/object/public/likethem-assets/qrs/123456-abc.png",
  "paymentMethod": "yape",
  "settings": {
    "id": "clxxxxx",
    "yapeQRCode": "https://supabase-url/storage/v1/object/public/likethem-assets/qrs/123456-abc.png",
    // ... all settings
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input (missing file, invalid payment method, file too large, not an image)
- `401 Unauthorized` - No authentication
- `403 Forbidden` - User is not an admin
- `500 Internal Server Error` - Server error or Supabase upload failure

**Validation Rules:**
- File size must be ≤ 5MB
- File must be an image type (image/*)
- Payment method must be 'yape' or 'plin'

**Storage Details:**
- Bucket: `likethem-assets`
- Folder: `qrs`
- File naming: `{timestamp}-{random}.{extension}`

---

### 3. Public Payment Methods API

**Base Path:** `/api/payment-methods`

#### GET - Get Enabled Payment Methods

**Authentication:** Not required (Public endpoint)

**Description:** Returns all enabled payment methods with their configuration. This endpoint is public and can be accessed by anyone.

**Request:**
```http
GET /api/payment-methods
```

**Response (200 OK):**
```json
{
  "methods": [
    {
      "id": "yape",
      "name": "Yape",
      "type": "yape",
      "enabled": true,
      "phoneNumber": "+51987654321",
      "qrCode": "https://supabase-url/.../qrs/yape-qr.png",
      "instructions": "Realiza el pago escaneando el código QR...",
      "icon": "Smartphone"
    },
    {
      "id": "plin",
      "name": "Plin",
      "type": "plin",
      "enabled": true,
      "phoneNumber": "+51912345678",
      "qrCode": "https://supabase-url/.../qrs/plin-qr.png",
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
  "defaultMethod": "yape",
  "commissionRate": 0.10
}
```

**Response Fields:**
- `methods` (array): Array of enabled payment methods
  - `id` (string): Unique identifier for the payment method
  - `name` (string): Display name
  - `type` (string): Payment method type
  - `enabled` (boolean): Whether the method is enabled
  - `phoneNumber` (string, optional): Phone number for Yape/Plin
  - `qrCode` (string, optional): QR code image URL for Yape/Plin
  - `instructions` (string, optional): Payment instructions for Yape/Plin
  - `icon` (string): Icon identifier for frontend
- `defaultMethod` (string): Default payment method ID
- `commissionRate` (float): Platform commission rate

**Default Behavior:**
- If no settings exist, returns Stripe as the only enabled method
- If no methods are enabled, returns Stripe as default
- On error, returns default configuration with Stripe

**Error Handling:**
- The endpoint always returns 200 OK
- On database errors, it returns a safe default configuration
- This ensures the checkout process never breaks due to missing settings

---

## Database Schema

The API uses the `PaymentSettings` model from Prisma:

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
  stripePublicKey       String?
  stripeSecretKey       String?
  defaultPaymentMethod  String   @default("stripe")
  commissionRate        Float    @default(0.10)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  updatedBy             String?

  @@map("payment_settings")
}
```

## Authentication

### Admin Endpoints
The admin endpoints (`/api/admin/payment-settings/*`) use the following authentication pattern:

```typescript
const user = await getApiUser(request)
if (!user) {
  return createApiErrorResponse('Unauthorized', 401)
}
requireApiRole(user, 'ADMIN')
```

This ensures:
1. User is authenticated via NextAuth session
2. User has ADMIN role in the database
3. Throws error if role requirements are not met

### Public Endpoint
The public endpoint (`/api/payment-methods`) does not require authentication and can be accessed by anyone.

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message here"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

## Usage Examples

### Frontend Integration

#### Fetch Payment Methods (Public)
```typescript
const response = await fetch('/api/payment-methods')
const { methods, defaultMethod, commissionRate } = await response.json()
```

#### Update Settings (Admin)
```typescript
const response = await fetch('/api/admin/payment-settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    yapeEnabled: true,
    yapePhoneNumber: '+51987654321',
    defaultPaymentMethod: 'yape'
  })
})
const { settings } = await response.json()
```

#### Upload QR Code (Admin)
```typescript
const formData = new FormData()
formData.append('file', qrImageFile)
formData.append('paymentMethod', 'yape')

const response = await fetch('/api/admin/payment-settings/upload-qr', {
  method: 'POST',
  body: formData
})
const { url, settings } = await response.json()
```

## Testing

### Manual Testing with cURL

#### Get Payment Settings
```bash
curl -X GET http://localhost:3000/api/admin/payment-settings \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

#### Update Payment Settings
```bash
curl -X PUT http://localhost:3000/api/admin/payment-settings \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "yapeEnabled": true,
    "yapePhoneNumber": "+51987654321",
    "defaultPaymentMethod": "yape"
  }'
```

#### Upload QR Code
```bash
curl -X POST http://localhost:3000/api/admin/payment-settings/upload-qr \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -F "file=@qr-code.png" \
  -F "paymentMethod=yape"
```

#### Get Public Payment Methods
```bash
curl -X GET http://localhost:3000/api/payment-methods
```

## Notes

1. **Single Settings Record**: The system maintains only one PaymentSettings record (the most recent). All updates modify this single record.

2. **Default Settings**: If no settings exist, the GET endpoint automatically creates default settings with Stripe enabled.

3. **File Storage**: QR codes are stored in Supabase Storage in the `likethem-assets` bucket under the `qrs` folder.

4. **Commission Rate**: The commission rate is stored as a decimal (0.10 = 10%). Frontend should multiply by 100 for display.

5. **Runtime**: All endpoints use Node.js runtime (not Edge runtime) due to Prisma requirements.

6. **Prisma Client**: Uses the singleton Prisma client from `@/lib/prisma` to avoid connection issues.

7. **Error Recovery**: The public endpoint is designed to never fail completely - it returns safe defaults if the database is unavailable.
