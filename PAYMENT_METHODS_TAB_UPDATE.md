# Payment Methods Tab - Update Summary

## File Updated
`app/dashboard/curator/settings/page.tsx`

## Changes Made

### 1. **Added CreditCard Icon Import** (Line 33)
```typescript
import { 
  // ... other imports
  CreditCard
} from 'lucide-react'
```

### 2. **Updated ActiveTab Type** (Line 80)
```typescript
const [activeTab, setActiveTab] = useState<'store' | 'notifications' | 'security' | 'privacy' | 'payments' | 'danger'>('store')
```

### 3. **Added Payment Interfaces** (Lines 65-76)
```typescript
interface PaymentMethod {
  enabled: boolean
  phoneNumber: string
  qrCodeUrl: string
  instructions: string
}

interface PaymentSettings {
  yape: PaymentMethod
  plin: PaymentMethod
}
```

### 4. **Added Payment State Variables** (Lines 197-215)
- `paymentSettings`: Main payment data
- `isLoadingPayments`: Loading state for fetching
- `isSavingPayments`: Loading state for saving
- `isUploadingQR`: Loading state for QR uploads (per method)
- `qrPreviews`: Local preview URLs for uploaded QR images

### 5. **Added Payment Tab to Tabs Array** (Line 227)
```typescript
{ id: 'payments', label: 'Métodos de Pago', icon: <CreditCard className="w-4 h-4" /> }
```

### 6. **Added Payment Functions** (Lines 527-650)
- `fetchPaymentSettings()`: Fetches payment settings from API
- `handlePaymentMethodChange()`: Updates payment method fields
- `handleQRUpload()`: Handles QR code image upload
- `savePaymentSettings()`: Saves payment settings to API

### 7. **Added Payment Methods Tab Content** (Lines 1201-1435)
Complete UI section with:
- **Yape Section**:
  - Enable/disable toggle (purple theme)
  - Phone number input
  - QR code upload with preview
  - Instructions textarea
  
- **Plin Section**:
  - Enable/disable toggle (blue theme)
  - Phone number input
  - QR code upload with preview
  - Instructions textarea
  
- **Save Button**:
  - Loading state with spinner
  - Calls `savePaymentSettings()`

## API Endpoints Used

### GET `/api/curator/payment-settings`
Fetches current payment settings for the curator.

**Expected Response:**
```json
{
  "yape": {
    "enabled": boolean,
    "phoneNumber": string,
    "qrCodeUrl": string,
    "instructions": string
  },
  "plin": {
    "enabled": boolean,
    "phoneNumber": string,
    "qrCodeUrl": string,
    "instructions": string
  }
}
```

### PUT `/api/curator/payment-settings`
Updates payment settings for the curator.

**Request Body:**
```json
{
  "yape": { /* PaymentMethod */ },
  "plin": { /* PaymentMethod */ }
}
```

### POST `/api/curator/payment-settings/upload-qr`
Uploads QR code image for a payment method.

**Request:** FormData with:
- `file`: Image file (JPG/PNG, max 5MB)
- `paymentMethod`: 'yape' | 'plin'

**Expected Response:**
```json
{
  "url": string
}
```

## Features Implemented

✅ **Tab Navigation**: Added "Métodos de Pago" tab with CreditCard icon  
✅ **Lazy Loading**: Payment settings only fetched when tab is active  
✅ **Yape Configuration**: Full configuration with toggle, phone, QR, and instructions  
✅ **Plin Configuration**: Full configuration with toggle, phone, QR, and instructions  
✅ **QR Upload**: Drag-and-drop style upload with preview and progress indicator  
✅ **Image Validation**: File size (5MB) and type (JPG/PNG) validation  
✅ **Loading States**: Separate loading states for fetching, saving, and uploading  
✅ **Success Toast**: Reuses existing toast notification system  
✅ **Error Handling**: Alert-based error messages for API failures  
✅ **Consistent Styling**: Matches existing tab sections and UI patterns  
✅ **Color Themes**: Purple for Yape, Blue for Plin  

## UI/UX Details

- **Responsive Design**: Uses existing grid and spacing patterns
- **Icon Usage**: CreditCard icon for both payment methods with different background colors
- **Toggle Switches**: Same pattern as notifications and privacy tabs
- **Input Fields**: Consistent styling with other form inputs
- **QR Preview**: 128px × 128px image preview with border
- **Upload Button**: Dashed border, hover effects, and loading spinner
- **Save Button**: Carbon-colored, disabled during save, with spinner animation
- **Empty States**: Loading spinner shown while fetching data
- **Spanish Labels**: All UI text in Spanish as per requirement

## Testing Checklist

- [ ] Tab appears in sidebar navigation
- [ ] Tab switches correctly when clicked
- [ ] Payment settings are fetched on first tab open
- [ ] Enable/disable toggles work for both methods
- [ ] Phone number inputs accept and update values
- [ ] QR upload validates file size and type
- [ ] QR upload shows preview after selection
- [ ] QR upload calls correct API endpoint
- [ ] Instructions textarea accepts multi-line text
- [ ] Save button is disabled during save operation
- [ ] Save button calls PUT endpoint with correct data
- [ ] Success toast appears after successful save
- [ ] Error alerts appear on API failures
- [ ] All existing tabs still work correctly
- [ ] No TypeScript/compilation errors

## Notes

- No Stripe section added (as per requirements)
- All APIs are curator-specific (not admin)
- File uses existing `safeSrc` helper for image URLs
- Reuses existing toast and modal patterns
- Maintains backward compatibility with all existing features
