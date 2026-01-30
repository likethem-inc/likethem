# Frontend Integration Checklist

## 🎯 Overview
This checklist guides frontend developers through integrating the Payment Settings API into the likethem platform.

## ✅ Prerequisites
- [ ] Backend API endpoints are deployed
- [ ] Database migrations are complete (PaymentSettings model exists)
- [ ] Supabase Storage is configured (bucket: likethem-assets)
- [ ] Admin user exists in the system

## 📋 Integration Tasks

### Phase 1: Admin Payment Settings Page

#### 1.1 Create Admin Settings Page
- [ ] Create route: `/admin/payment-settings` or similar
- [ ] Add to admin navigation menu
- [ ] Implement admin-only route guard

**File Location:** `app/admin/payment-settings/page.tsx` (or similar)

#### 1.2 Fetch Current Settings
- [ ] Create API hook to fetch settings
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Display current configuration

**Example Code:**
```typescript
const { data: settings, loading, error } = usePaymentSettings()
```

#### 1.3 Settings Form
Create form with these fields:

**Yape Settings:**
- [ ] Enable/Disable toggle
- [ ] Phone number input (required when enabled)
- [ ] Instructions textarea
- [ ] QR code display
- [ ] QR code upload button

**Plin Settings:**
- [ ] Enable/Disable toggle
- [ ] Phone number input (required when enabled)
- [ ] Instructions textarea
- [ ] QR code display
- [ ] QR code upload button

**Stripe Settings:**
- [ ] Enable/Disable toggle

**General Settings:**
- [ ] Default payment method selector
- [ ] Commission rate input (percentage)

#### 1.4 Form Validation
- [ ] Validate phone numbers (format: +51XXXXXXXXX)
- [ ] Require phone number when method is enabled
- [ ] Validate commission rate (0-100%)
- [ ] Validate at least one payment method is enabled

#### 1.5 Save Settings
- [ ] Create save handler
- [ ] Call PUT endpoint
- [ ] Show success notification
- [ ] Show error notification
- [ ] Update form with new values

**Example Code:**
```typescript
const handleSave = async (formData) => {
  const response = await fetch('/api/admin/payment-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  // Handle response...
}
```

#### 1.6 QR Code Upload
- [ ] Create file input component
- [ ] Validate file (max 5MB, image only)
- [ ] Create FormData with file + paymentMethod
- [ ] Call POST /api/admin/payment-settings/upload-qr
- [ ] Show upload progress
- [ ] Display uploaded QR code
- [ ] Update settings state with new URL

**Example Code:**
```typescript
const handleQRUpload = async (file: File, method: 'yape' | 'plin') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('paymentMethod', method)
  
  const response = await fetch('/api/admin/payment-settings/upload-qr', {
    method: 'POST',
    body: formData
  })
  // Handle response...
}
```

#### 1.7 UI/UX Enhancements
- [ ] Add loading spinners
- [ ] Add success/error toasts
- [ ] Add confirmation dialogs for destructive actions
- [ ] Add help text/tooltips
- [ ] Make form responsive
- [ ] Add preview for QR codes

---

### Phase 2: Public Payment Methods Integration

#### 2.1 Create Payment Methods Hook
- [ ] Create `usePaymentMethods()` hook
- [ ] Fetch from `/api/payment-methods`
- [ ] Cache results (consider SWR or React Query)
- [ ] Handle loading and error states

**Example Code:**
```typescript
export function usePaymentMethods() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/payment-methods')
      .then(res => res.json())
      .then(data => {
        setMethods(data.methods)
        setLoading(false)
      })
  }, [])
  
  return { methods, loading }
}
```

#### 2.2 Update Checkout Flow
- [ ] Import usePaymentMethods hook
- [ ] Display enabled payment methods
- [ ] Allow user to select payment method
- [ ] Show method-specific UI:
  - Stripe: Credit card form
  - Yape/Plin: QR code + phone number + instructions

#### 2.3 Payment Method Components

**Create Components:**
- [ ] `<PaymentMethodSelector />` - List of available methods
- [ ] `<StripePaymentForm />` - Stripe credit card form
- [ ] `<YapePaymentForm />` - Yape QR + instructions
- [ ] `<PlinPaymentForm />` - Plin QR + instructions

#### 2.4 Yape/Plin Payment Flow
When user selects Yape or Plin:
- [ ] Display QR code (large, scannable)
- [ ] Display phone number
- [ ] Display instructions
- [ ] Add payment proof upload field
- [ ] Add transaction code input field
- [ ] Validate required fields before submission

#### 2.5 Order Submission
Update order creation to include:
- [ ] Selected payment method
- [ ] Payment proof URL (for Yape/Plin)
- [ ] Transaction code (for Yape/Plin)
- [ ] Calculate commission based on settings.commissionRate

**Example:**
```typescript
const orderData = {
  ...cartData,
  paymentMethod: selectedMethod, // 'yape' | 'plin' | 'stripe'
  paymentProof: paymentProofUrl,  // For Yape/Plin
  transactionCode: txCode,        // For Yape/Plin
}
```

---

### Phase 3: Order Management Updates

#### 3.1 Display Payment Method in Orders
- [ ] Show payment method in order list
- [ ] Show payment method in order details
- [ ] Display payment proof (if Yape/Plin)
- [ ] Display transaction code (if Yape/Plin)

#### 3.2 Admin Order Review
- [ ] Add payment proof preview
- [ ] Add verify/approve payment button
- [ ] Add reject payment button
- [ ] Show payment status

---

## 🧪 Testing Checklist

### Manual Testing
- [ ] Test as admin: View settings page
- [ ] Test as admin: Update Yape settings
- [ ] Test as admin: Update Plin settings
- [ ] Test as admin: Upload QR codes
- [ ] Test as admin: Save settings
- [ ] Test as buyer: View payment methods in checkout
- [ ] Test as buyer: Select Yape payment
- [ ] Test as buyer: Select Plin payment
- [ ] Test as buyer: Select Stripe payment
- [ ] Test as buyer: Complete order with each method
- [ ] Test error handling (invalid inputs)
- [ ] Test loading states
- [ ] Test with no settings (should use defaults)

### Edge Cases
- [ ] No payment methods enabled (should show Stripe)
- [ ] Invalid phone number format
- [ ] QR code upload fails
- [ ] Large QR code file (>5MB)
- [ ] Non-image file upload
- [ ] Network errors
- [ ] Session expired during upload
- [ ] Missing required fields

### Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

### Responsive Testing
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 📱 UI Components Needed

### Admin Components
1. **PaymentSettingsForm**
   - Toggle switches for each method
   - Input fields (phone, instructions)
   - File upload for QR codes
   - Save/Cancel buttons

2. **QRCodeUploader**
   - Drag-and-drop file input
   - Image preview
   - Upload progress bar
   - Error messages

3. **PhoneNumberInput**
   - Formatted input (+51XXXXXXXXX)
   - Validation feedback

### Public Components
4. **PaymentMethodCard**
   - Icon
   - Name
   - Description
   - Select button

5. **QRCodeDisplay**
   - Large QR image
   - Phone number
   - Instructions
   - Copy button for phone

6. **PaymentProofUploader**
   - File input
   - Image preview
   - Upload to storage

---

## 🎨 Design Considerations

### Admin Settings Page
- Clean, organized layout
- Group related settings together
- Visual hierarchy (headings, spacing)
- Inline validation feedback
- Success/error notifications
- Preview of how it looks to buyers

### Checkout Flow
- Clear payment method selection
- Prominent QR codes (easy to scan)
- Copy-to-clipboard for phone numbers
- Clear instructions
- Visual feedback for selected method
- Mobile-friendly QR codes

---

## 📚 Reference Materials

- **API Documentation:** `/docs/PAYMENT_SETTINGS_API.md`
- **Quick Reference:** `/docs/PAYMENT_SETTINGS_QUICK_REF.md`
- **Implementation Summary:** `/docs/PAYMENT_SETTINGS_IMPLEMENTATION.md`
- **Test Script:** `/scripts/test-payment-api.js`

---

## 🔗 API Endpoints Reference

```typescript
// Public
GET  /api/payment-methods                          // Get enabled methods

// Admin Only
GET  /api/admin/payment-settings                   // Get current settings
PUT  /api/admin/payment-settings                   // Update settings
POST /api/admin/payment-settings/upload-qr         // Upload QR code
```

---

## 💡 Tips

1. **Use TypeScript:** Define interfaces for settings and payment methods
2. **Reusable Hooks:** Create custom hooks for API calls
3. **Loading States:** Always show loading indicators
4. **Error Handling:** Display user-friendly error messages
5. **Validation:** Validate on client side before API calls
6. **Caching:** Cache payment methods data
7. **Optimistic Updates:** Update UI before API response
8. **Mobile First:** Design for mobile, enhance for desktop

---

## 🚨 Common Pitfalls

- ❌ Not validating phone numbers before save
- ❌ Not handling QR upload errors
- ❌ Not showing loading states
- ❌ Not caching payment methods
- ❌ Making QR codes too small on mobile
- ❌ Not handling missing payment methods gracefully
- ❌ Hardcoding payment methods instead of using API
- ❌ Not testing with actual QR scanners

---

## ✅ Definition of Done

Phase is complete when:
- [ ] All checkboxes above are checked
- [ ] Code is reviewed and approved
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Feature is deployed to staging
- [ ] Feature is tested by QA
- [ ] Feature is approved by product owner

---

## 🎉 Success Criteria

The integration is successful when:
1. Admins can configure payment methods
2. Admins can upload QR codes
3. Buyers see enabled payment methods
4. Buyers can complete orders with each method
5. Orders store payment method information
6. Payment proofs are uploaded and displayed
7. All error cases are handled gracefully
8. UI is responsive and accessible

---

**Last Updated:** 2024
**Status:** Ready for Frontend Development
**Backend:** ✅ Complete
**Frontend:** ⏳ Pending
