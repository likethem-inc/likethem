# Admin Settings UI - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Admin user account
- Supabase configured (for QR code uploads)
- PostgreSQL database with PaymentSettings table

### Access the Page

```bash
# Development
npm run dev

# Navigate to:
http://localhost:3000/admin/settings
```

### First Time Setup

1. **Login as Admin**
   - Use an account with `role: 'ADMIN'`
   - Non-admin users will be blocked

2. **Default Settings**
   - If no settings exist, defaults are created automatically
   - Stripe: Enabled by default
   - Yape/Plin: Disabled by default
   - Commission rate: 10%

## 📝 Configuration Steps

### Configure Yape

```typescript
1. Toggle "Enabled" switch to ON
2. Enter phone number: e.g., "+51 999 999 999"
3. Click "Upload QR Code" button
4. Select PNG/JPG/WEBP image (max 5MB)
5. Preview appears immediately
6. Upload happens automatically
7. Customize instructions (optional)
8. Click "Save Settings"
```

### Configure Plin

```typescript
// Same steps as Yape
1. Toggle "Enabled" switch to ON
2. Enter phone number
3. Upload QR code
4. Customize instructions
5. Save
```

### Configure Stripe

```typescript
1. Toggle "Enabled" switch to ON
2. Enter Stripe Publishable Key: "pk_live_..."
3. Enter Stripe Secret Key: "sk_live_..."
4. Click "Save Settings"
```

### Set General Settings

```typescript
1. Select Default Payment Method: stripe | yape | plin
2. Set Commission Rate: 0-100%
3. Click "Save Settings"
```

## 🔧 Development

### Component Structure

```tsx
SettingsPage (Client Component)
├── State Management
│   ├── formData (PaymentSettingsFormData)
│   ├── loading states
│   ├── preview states
│   └── toast state
├── API Handlers
│   ├── fetchSettings()
│   ├── handleSave()
│   ├── uploadQRCode()
│   └── handleFileSelect()
└── UI Sections
    ├── Yape Section
    ├── Plin Section
    ├── Stripe Section
    └── General Settings
```

### Key Functions

```typescript
// Fetch settings on mount
const fetchSettings = useCallback(async () => {
  const response = await fetch('/api/admin/payment-settings')
  const data = await response.json()
  setFormData(data.settings)
}, [])

// Upload QR code
const uploadQRCode = async (file: File, method: 'yape' | 'plin') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('paymentMethod', method)
  
  const response = await fetch('/api/admin/payment-settings/upload-qr', {
    method: 'POST',
    body: formData,
  })
  
  const data = await response.json()
  // Update form with new QR URL
}

// Save settings
const handleSave = async () => {
  const response = await fetch('/api/admin/payment-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  // Show success/error toast
}
```

### Type Definitions

```typescript
import type { 
  PaymentSettings,           // Database model type
  PaymentSettingsFormData,   // Form state type
  PaymentSettingsResponse,   // API response type
  UploadQRResponse          // Upload response type
} from '@/types/payment-settings'
```

## 🎨 Styling

### Tailwind Classes Used

```css
/* Sections */
.bg-white.border.border-gray-200.rounded-lg

/* Headers */
.px-6.py-4.bg-gray-50.border-b.border-gray-200

/* Inputs */
.w-full.px-4.py-2.border.border-gray-300.rounded-lg
.focus:ring-2.focus:ring-black.focus:border-transparent

/* Buttons */
.bg-gray-900.text-white.rounded-lg
.hover:bg-gray-800.transition-colors

/* Toggle */
.w-5.h-5.text-black.border-gray-300.rounded
.focus:ring-black
```

## 🐛 Troubleshooting

### Common Issues

**1. "Failed to load payment settings"**
```bash
# Check API route is accessible
curl http://localhost:3000/api/admin/payment-settings

# Verify user has ADMIN role
SELECT role FROM users WHERE id = 'your-user-id';
```

**2. "Image upload service not configured"**
```bash
# Check .env variables
NEXT_PUBLIC_SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key

# Verify Supabase connection
```

**3. QR code upload fails**
```bash
# Check file size (must be < 5MB)
# Check file type (must be image/*)
# Check Supabase bucket permissions
# Check server logs for detailed error
```

**4. Save button does nothing**
```bash
# Open browser console
# Check for validation errors
# Verify phone numbers when methods enabled
# Check commission rate is 0-100%
```

## 📊 State Management

### Form State Flow

```
1. Page Load
   └── fetchSettings()
       └── GET /api/admin/payment-settings
           └── setFormData(response.settings)
           └── setYapePreview(settings.yapeQRCode)
           └── setPlinPreview(settings.plinQRCode)

2. QR Upload
   └── handleFileSelect(file, method)
       └── Validate file (size, type)
       └── Create preview (FileReader)
       └── uploadQRCode(file, method)
           └── POST /api/admin/payment-settings/upload-qr
               └── Update formData with new URL
               └── Show success toast

3. Save Settings
   └── handleSave()
       └── Validate form
       └── PUT /api/admin/payment-settings
           └── Show success toast
           └── fetchSettings() (refresh)
```

## 🔐 Security Notes

- All API calls require admin authentication
- File uploads validated on client and server
- Secret keys use password input type
- CSRF protection via Next.js
- Rate limiting recommended for production

## 📱 Mobile Responsive

The UI is fully responsive:
- Stacks vertically on mobile
- Touch-friendly buttons (min 44x44px)
- Scrollable sections
- Adaptive text sizing

## 🧪 Testing Example

```typescript
// Manual test script
async function testSettingsPage() {
  // 1. Load page
  await page.goto('/admin/settings')
  
  // 2. Toggle Yape
  await page.click('[data-testid="yape-toggle"]')
  
  // 3. Enter phone
  await page.fill('[data-testid="yape-phone"]', '+51999999999')
  
  // 4. Upload QR (programmatic)
  const fileInput = await page.$('input[type="file"]')
  await fileInput.setInputFiles('./test-qr.png')
  
  // 5. Wait for upload
  await page.waitForSelector('[data-testid="yape-preview"]')
  
  // 6. Save
  await page.click('[data-testid="save-button"]')
  
  // 7. Verify toast
  await page.waitForSelector('[data-testid="toast-success"]')
}
```

## 📞 Support

- Check `ADMIN_SETTINGS_UI_README.md` for full documentation
- Review `types/payment-settings.ts` for type definitions
- See API routes in `app/api/admin/payment-settings/`

## 🎉 Success!

You now have a fully functional Admin Settings UI for managing payment methods. The page includes:
- ✅ Real-time validation
- ✅ Image uploads
- ✅ User feedback
- ✅ Responsive design
- ✅ Type safety
- ✅ Error handling

Happy configuring! 🚀
