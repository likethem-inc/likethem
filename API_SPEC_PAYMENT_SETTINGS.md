# Payment Settings API Specification

This document describes the API endpoints that need to be implemented to support the Payment Methods tab in the curator settings.

## Base Path
All endpoints are prefixed with `/api/curator/payment-settings`

---

## 1. GET `/api/curator/payment-settings`

Retrieves the current payment settings for the authenticated curator.

### Authentication
- Requires: Valid session with curator role
- Session check: `req.auth` or `getServerSession()`

### Request
```http
GET /api/curator/payment-settings HTTP/1.1
Cookie: next-auth.session-token=...
```

### Response - Success (200)
```json
{
  "yape": {
    "enabled": true,
    "phoneNumber": "999888777",
    "qrCodeUrl": "https://cdn.likethem.com/qr/yape-123.png",
    "instructions": "Por favor envía captura después de yapear"
  },
  "plin": {
    "enabled": false,
    "phoneNumber": "",
    "qrCodeUrl": "",
    "instructions": ""
  }
}
```

### Response - Not Found (404)
When curator has no payment settings configured yet:
```json
{
  "yape": {
    "enabled": false,
    "phoneNumber": "",
    "qrCodeUrl": "",
    "instructions": ""
  },
  "plin": {
    "enabled": false,
    "phoneNumber": "",
    "qrCodeUrl": "",
    "instructions": ""
  }
}
```

### Response - Unauthorized (401)
```json
{
  "error": "Unauthorized - Please sign in"
}
```

### Database Schema Suggestion
```prisma
model CuratorProfile {
  id String @id @default(cuid())
  userId String @unique
  // ... existing fields
  
  // Payment settings
  yapeEnabled Boolean @default(false)
  yapePhoneNumber String?
  yapeQrCodeUrl String?
  yapeInstructions String?
  
  plinEnabled Boolean @default(false)
  plinPhoneNumber String?
  plinQrCodeUrl String?
  plinInstructions String?
  
  // ... other fields
}
```

---

## 2. PUT `/api/curator/payment-settings`

Updates the payment settings for the authenticated curator.

### Authentication
- Requires: Valid session with curator role

### Request
```http
PUT /api/curator/payment-settings HTTP/1.1
Content-Type: application/json
Cookie: next-auth.session-token=...

{
  "yape": {
    "enabled": true,
    "phoneNumber": "999888777",
    "qrCodeUrl": "https://cdn.likethem.com/qr/yape-123.png",
    "instructions": "Por favor envía captura después de yapear"
  },
  "plin": {
    "enabled": false,
    "phoneNumber": "",
    "qrCodeUrl": "",
    "instructions": ""
  }
}
```

### Validation Rules
- `enabled`: Required boolean
- `phoneNumber`: Optional string, validate phone format if present
- `qrCodeUrl`: Optional string, validate URL format if present
- `instructions`: Optional string, max 500 characters

### Response - Success (200)
```json
{
  "message": "Payment settings updated successfully",
  "data": {
    "yape": { /* updated values */ },
    "plin": { /* updated values */ }
  }
}
```

### Response - Bad Request (400)
```json
{
  "error": "Invalid payment settings format",
  "details": [
    "yape.phoneNumber must be a valid phone number"
  ]
}
```

### Response - Unauthorized (401)
```json
{
  "error": "Unauthorized - Please sign in"
}
```

### Implementation Example
```typescript
// app/api/curator/payment-settings/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { yape, plin } = body

    // Validate data
    if (!yape || !plin) {
      return Response.json(
        { error: 'Invalid payment settings format' },
        { status: 400 }
      )
    }

    // Update curator profile
    const updated = await prisma.curatorProfile.update({
      where: { userId: session.user.id },
      data: {
        yapeEnabled: yape.enabled,
        yapePhoneNumber: yape.phoneNumber,
        yapeQrCodeUrl: yape.qrCodeUrl,
        yapeInstructions: yape.instructions,
        plinEnabled: plin.enabled,
        plinPhoneNumber: plin.phoneNumber,
        plinQrCodeUrl: plin.qrCodeUrl,
        plinInstructions: plin.instructions,
      }
    })

    return Response.json({
      message: 'Payment settings updated successfully',
      data: {
        yape: {
          enabled: updated.yapeEnabled,
          phoneNumber: updated.yapePhoneNumber || '',
          qrCodeUrl: updated.yapeQrCodeUrl || '',
          instructions: updated.yapeInstructions || ''
        },
        plin: {
          enabled: updated.plinEnabled,
          phoneNumber: updated.plinPhoneNumber || '',
          qrCodeUrl: updated.plinQrCodeUrl || '',
          instructions: updated.plinInstructions || ''
        }
      }
    })
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return Response.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    )
  }
}
```

---

## 3. POST `/api/curator/payment-settings/upload-qr`

Uploads a QR code image for a specific payment method.

### Authentication
- Requires: Valid session with curator role

### Request
```http
POST /api/curator/payment-settings/upload-qr HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
Cookie: next-auth.session-token=...

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="yape-qr.png"
Content-Type: image/png

<binary image data>
------WebKitFormBoundary
Content-Disposition: form-data; name="paymentMethod"

yape
------WebKitFormBoundary--
```

### Form Fields
- `file`: Image file (JPG/PNG)
- `paymentMethod`: String ('yape' or 'plin')

### Validation Rules
- File type: Must be `image/jpeg`, `image/jpg`, or `image/png`
- File size: Maximum 5MB (5,242,880 bytes)
- File name: Sanitize and generate unique name

### Response - Success (200)
```json
{
  "url": "https://cdn.likethem.com/qr/curator-123-yape-abc123.png",
  "message": "QR code uploaded successfully"
}
```

### Response - Bad Request (400)
```json
{
  "error": "Invalid file type. Only JPG and PNG are allowed"
}
```

OR

```json
{
  "error": "File size exceeds 5MB limit"
}
```

OR

```json
{
  "error": "Payment method must be 'yape' or 'plin'"
}
```

### Response - Unauthorized (401)
```json
{
  "error": "Unauthorized - Please sign in"
}
```

### Implementation Example
```typescript
// app/api/curator/payment-settings/upload-qr/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const paymentMethod = formData.get('paymentMethod') as string

    // Validate payment method
    if (!['yape', 'plin'].includes(paymentMethod)) {
      return Response.json(
        { error: "Payment method must be 'yape' or 'plin'" },
        { status: 400 }
      )
    }

    // Validate file
    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Only JPG and PNG are allowed' },
        { status: 400 }
      )
    }

    // Check file size (5MB = 5,242,880 bytes)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const uniqueId = uuidv4()
    const filename = `${session.user.id}-${paymentMethod}-${uniqueId}.${ext}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads/qr or upload to CDN
    const uploadPath = join(process.cwd(), 'public', 'uploads', 'qr')
    const filePath = join(uploadPath, filename)
    
    await writeFile(filePath, buffer)

    // Return public URL
    const url = `/uploads/qr/${filename}`
    
    return Response.json({
      url,
      message: 'QR code uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading QR code:', error)
    return Response.json(
      { error: 'Failed to upload QR code' },
      { status: 500 }
    )
  }
}
```

### Alternative: Using Existing Upload API

If you prefer to use the existing `/api/upload` endpoint:

```typescript
// In the frontend (already implemented in page.tsx):
const formData = new FormData()
formData.append('file', file)
formData.append('paymentMethod', method)

const response = await fetch('/api/curator/payment-settings/upload-qr', {
  method: 'POST',
  body: formData
})

// OR adapt existing /api/upload:
const formData = new FormData()
formData.append('images', file)
formData.append('folder', `payment-qr/${method}`)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

---

## Security Considerations

### 1. Authentication
- All endpoints MUST verify user session
- Only authenticated curators can access their own settings
- No admin override for curator payment settings

### 2. File Upload Security
- Validate file type (MIME type checking)
- Validate file size (prevent DoS attacks)
- Sanitize filenames (prevent path traversal)
- Store files outside webroot or use CDN
- Generate unique filenames to prevent overwrites
- Scan uploaded files for malware (optional but recommended)

### 3. Data Validation
- Validate all input fields
- Sanitize HTML/scripts in instructions field
- Validate phone number format
- Validate URL format for QR codes
- Use prepared statements for database queries (Prisma handles this)

### 4. Rate Limiting
Consider implementing rate limits for:
- GET requests: 100/minute
- PUT requests: 10/minute
- POST uploads: 5/minute

### 5. CORS
- Same-origin policy should be sufficient
- No need for CORS headers since API and frontend share domain

---

## Testing Checklist

### Unit Tests
- [ ] GET returns correct data structure
- [ ] GET handles missing settings (returns defaults)
- [ ] GET rejects unauthorized requests
- [ ] PUT validates required fields
- [ ] PUT updates database correctly
- [ ] PUT rejects invalid data
- [ ] POST validates file type
- [ ] POST validates file size
- [ ] POST generates unique filenames
- [ ] POST rejects invalid payment methods

### Integration Tests
- [ ] Complete flow: fetch → upload QR → save → fetch again
- [ ] Multiple QR uploads for same method (overwrites)
- [ ] Toggle enable/disable works correctly
- [ ] Session expiry handling
- [ ] Database transaction rollback on errors

### Manual Testing
- [ ] Upload various image formats (JPG, PNG, GIF, WEBP)
- [ ] Upload oversized files
- [ ] Upload files with special characters in name
- [ ] Test with slow network (check loading states)
- [ ] Test with network failure (check error handling)
- [ ] Test concurrent uploads (Yape + Plin simultaneously)

---

## Migration Script

If you need to add these fields to existing database:

```sql
-- Add payment settings columns to curator_profile table
ALTER TABLE curator_profile
ADD COLUMN yape_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN yape_phone_number VARCHAR(20),
ADD COLUMN yape_qr_code_url TEXT,
ADD COLUMN yape_instructions TEXT,
ADD COLUMN plin_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN plin_phone_number VARCHAR(20),
ADD COLUMN plin_qr_code_url TEXT,
ADD COLUMN plin_instructions TEXT;

-- Create index for faster queries
CREATE INDEX idx_curator_payment_enabled ON curator_profile(yape_enabled, plin_enabled);
```

Or with Prisma:

```bash
npx prisma migrate dev --name add_payment_settings
```

---

## Future Enhancements

Consider these features for future iterations:

1. **Additional Payment Methods**
   - Stripe integration
   - PayPal
   - Bank transfers

2. **Advanced Validation**
   - Phone number verification via SMS
   - QR code validation (check if it's a valid payment QR)

3. **Analytics**
   - Track which payment methods are used most
   - Payment conversion rates

4. **Webhooks**
   - Notify curator when payment is received
   - Auto-confirm orders on payment

5. **Multi-currency**
   - Support for different currencies
   - Exchange rate calculations

6. **QR Code Generation**
   - Auto-generate QR codes from phone numbers
   - QR code expiry management
