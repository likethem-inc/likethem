# Admin Settings UI - Payment Methods Configuration

## Overview

The Admin Settings UI page provides a comprehensive interface for platform administrators to configure payment methods (Yape, Plin, and Stripe) and general platform settings.

**Location**: `app/admin/settings/page.tsx`

## Features

### 1. **Payment Method Configuration**

#### Yape Settings
- ✅ Enable/disable toggle
- ✅ Phone number input with validation
- ✅ QR code upload with preview
- ✅ Custom payment instructions textarea
- ✅ Real-time image upload with progress indication
- ✅ QR code removal functionality

#### Plin Settings
- ✅ Enable/disable toggle
- ✅ Phone number input with validation
- ✅ QR code upload with preview
- ✅ Custom payment instructions textarea
- ✅ Real-time image upload with progress indication
- ✅ QR code removal functionality

#### Stripe Settings
- ✅ Enable/disable toggle
- ✅ Publishable key input
- ✅ Secret key input (password field for security)
- ✅ Configuration hints for users

### 2. **General Platform Settings**

- **Default Payment Method**: Select which payment method is shown by default to customers
- **Commission Rate**: Configure platform commission rate (0-100%) for curator sales

### 3. **User Experience Features**

#### Loading States
- Initial page load spinner
- Save button loading state with spinner
- Individual QR upload loading states
- Disabled states during operations

#### Form Validation
- Phone number required when payment method is enabled
- Commission rate must be between 0-100%
- File size limit (5MB) for QR codes
- Image file type validation
- Real-time validation feedback

#### Toast Notifications
- Success messages for:
  - Settings saved successfully
  - QR codes uploaded successfully
- Error messages for:
  - Failed API requests
  - Validation errors
  - File upload errors

#### Image Handling
- QR code preview before upload
- Optimized Next.js Image component
- Support for PNG, JPG, WEBP formats
- Automatic upload on file selection
- Preview updates in real-time
- Remove QR code functionality

### 4. **Responsive Design**

- Mobile-friendly layout
- Collapsible sections
- Touch-friendly controls
- Adaptive form inputs

## API Integration

### Endpoints Used

1. **GET /api/admin/payment-settings**
   - Fetches current payment settings
   - Called on page load
   - Automatically creates default settings if none exist

2. **PUT /api/admin/payment-settings**
   - Updates payment settings
   - Validates required fields
   - Returns updated settings

3. **POST /api/admin/payment-settings/upload-qr**
   - Uploads QR code images to Supabase Storage
   - Validates file type and size
   - Returns public URL
   - Automatically updates payment settings

## Component Structure

```tsx
SettingsPage (Client Component)
├── AdminPageShell (Layout wrapper)
├── Yape Configuration Section
│   ├── Enable/Disable Toggle
│   ├── Phone Number Input
│   ├── QR Code Upload & Preview
│   └── Instructions Textarea
├── Plin Configuration Section
│   ├── Enable/Disable Toggle
│   ├── Phone Number Input
│   ├── QR Code Upload & Preview
│   └── Instructions Textarea
├── Stripe Configuration Section
│   ├── Enable/Disable Toggle
│   ├── Publishable Key Input
│   └── Secret Key Input
├── General Settings Section
│   ├── Default Payment Method Select
│   └── Commission Rate Input
├── Save Button
└── Toast Notification
```

## State Management

### Form State
```typescript
interface FormData {
  yapeEnabled: boolean
  yapePhoneNumber: string
  yapeQRCode: string | null
  yapeInstructions: string
  plinEnabled: boolean
  plinPhoneNumber: string
  plinQRCode: string | null
  plinInstructions: string
  stripeEnabled: boolean
  stripePublicKey: string
  stripeSecretKey: string
  defaultPaymentMethod: string
  commissionRate: number
}
```

### UI State
- `loading`: Initial data fetch state
- `saving`: Save operation state
- `uploadingYape`: Yape QR upload state
- `uploadingPlin`: Plin QR upload state
- `yapePreview`: Preview URL for Yape QR
- `plinPreview`: Preview URL for Plin QR
- `toast`: Toast notification state

## Security Considerations

1. **Admin-Only Access**: Page requires ADMIN role (enforced by API)
2. **Secret Key Protection**: Stripe secret key uses password input type
3. **File Validation**: Server-side validation of file uploads
4. **CSRF Protection**: Uses Next.js built-in protection
5. **API Authentication**: All endpoints validate user session

## Usage Guide

### For Administrators

1. **Navigate to Settings**
   - Go to `/admin/settings` in the admin dashboard

2. **Configure Yape/Plin**
   - Toggle the payment method on/off
   - Enter the phone number
   - Upload QR code image (click "Upload QR Code" button)
   - Customize payment instructions
   - Click "Save Settings"

3. **Configure Stripe**
   - Toggle Stripe on/off
   - Enter your Stripe publishable key
   - Enter your Stripe secret key
   - Click "Save Settings"

4. **Set General Settings**
   - Choose default payment method
   - Set commission rate (percentage)
   - Click "Save Settings"

### File Upload Flow

1. Click "Upload QR Code" button
2. Select image file (PNG, JPG, or WEBP)
3. Image is previewed immediately
4. File uploads automatically in background
5. Success/error toast appears
6. Click "Save Settings" to persist changes

## Error Handling

### Client-Side Errors
- File size too large (>5MB)
- Invalid file type (not an image)
- Missing required fields
- Invalid commission rate

### Server-Side Errors
- Unauthorized access (not admin)
- Missing Supabase configuration
- Upload failures
- Database errors

All errors display user-friendly toast notifications.

## Styling

- **Design System**: Tailwind CSS
- **Colors**: Neutral gray scale with black accents
- **Typography**: System fonts with consistent sizing
- **Components**: Custom-styled form inputs and buttons
- **Spacing**: Consistent padding and margins
- **Borders**: Subtle gray borders (1px)
- **Shadows**: Minimal, only on hover states

## Performance Optimizations

1. **Lazy Loading**: Image components use Next.js Image
2. **Optimistic Updates**: Preview images before upload completes
3. **Debounced State**: No unnecessary re-renders
4. **Parallel Requests**: Fetch and upload operations optimized
5. **Memoized Callbacks**: useCallback for stable function references

## Testing Checklist

- [ ] Page loads successfully for admin users
- [ ] Non-admin users cannot access
- [ ] Default settings are created if none exist
- [ ] Toggle switches work for all payment methods
- [ ] Phone number inputs accept valid formats
- [ ] QR code upload works for both Yape and Plin
- [ ] QR code preview displays correctly
- [ ] Remove QR code button works
- [ ] File size validation (>5MB rejected)
- [ ] File type validation (only images accepted)
- [ ] Save button persists changes
- [ ] Loading states appear during operations
- [ ] Toast notifications appear for success/errors
- [ ] Commission rate validation (0-100%)
- [ ] Default payment method dropdown works
- [ ] Form inputs disabled when payment method is off
- [ ] Page is responsive on mobile devices

## Future Enhancements

- [ ] Drag-and-drop QR code upload
- [ ] Bulk settings import/export
- [ ] Payment method testing interface
- [ ] Transaction fee calculator
- [ ] Multi-language instructions support
- [ ] QR code generation tool
- [ ] Payment method analytics
- [ ] Webhook configuration UI
- [ ] Email template customization

## Related Files

- **API Routes**:
  - `app/api/admin/payment-settings/route.ts`
  - `app/api/admin/payment-settings/upload-qr/route.ts`

- **Database**:
  - `prisma/schema.prisma` (PaymentSettings model)

- **Components**:
  - `components/admin/AdminPageShell.tsx`
  - `components/Toast.tsx`

- **Libraries**:
  - `lib/storage.ts` (Supabase upload utility)
  - `lib/api-auth.ts` (API authentication)

## Support

For issues or questions:
1. Check the API endpoints are working: `/api/admin/payment-settings`
2. Verify Supabase configuration in `.env`
3. Check browser console for errors
4. Review server logs for API errors

## Change Log

### Version 1.0.0 (Current)
- ✅ Initial implementation
- ✅ Full CRUD for payment settings
- ✅ QR code upload functionality
- ✅ Toast notifications
- ✅ Form validation
- ✅ Responsive design
- ✅ Loading states
- ✅ TypeScript types
- ✅ Next.js 14 compatibility
