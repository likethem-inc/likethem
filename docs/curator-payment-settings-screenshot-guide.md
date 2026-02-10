# Payment Methods Configuration - Curator Settings

## Location
Navigate to: **Dashboard → Settings → Métodos de Pago**

## Features

### Yape Configuration (Purple Theme)
- ✅ Enable/Disable Toggle
- 📱 Phone Number Input
- 📸 QR Code Upload (with preview)
- 📝 Instructions Text Area

### Plin Configuration (Blue Theme)  
- ✅ Enable/Disable Toggle
- 📱 Phone Number Input
- 📸 QR Code Upload (with preview)
- 📝 Instructions Text Area

### Actions
- 💾 Save All Settings Button (bottom of page)
- 🔄 Loading States for Upload and Save
- ✅ Success Toasts

## How It Works

1. Curator navigates to Settings tab in their dashboard
2. Clicks on "Métodos de Pago" in the left sidebar
3. Toggles payment methods on/off
4. Uploads QR codes (max 5MB, JPG/PNG)
5. Enters phone numbers
6. Adds custom instructions
7. Clicks Save button

## API Endpoints

- GET `/api/curator/payment-settings` - Fetch settings
- PUT `/api/curator/payment-settings` - Save settings
- POST `/api/curator/payment-settings/upload-qr` - Upload QR image

## Storage

QR images are stored in Supabase Storage:
- Bucket: `likethem-assets`
- Path: `qrs/{curatorId}_{paymentMethod}_{timestamp}.{ext}`

Example: `qrs/clx123_yape_1706583600000.jpg`
