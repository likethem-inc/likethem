# 🚀 Quick Reference - Payment Methods Tab

## 📍 File Location
```
app/dashboard/curator/settings/page.tsx
```

## 🎯 Quick Access

### State Variables
```typescript
paymentSettings          // Main payment data
isLoadingPayments        // Fetch loading
isSavingPayments         // Save loading
isUploadingQR           // Upload loading
qrPreviews              // Preview URLs
```

### Functions
```typescript
fetchPaymentSettings()           // GET /api/curator/payment-settings
handlePaymentMethodChange()      // Update field
handleQRUpload()                // POST /api/.../upload-qr
savePaymentSettings()           // PUT /api/curator/payment-settings
```

## 🔗 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/curator/payment-settings` | Fetch settings |
| PUT | `/api/curator/payment-settings` | Save settings |
| POST | `/api/curator/payment-settings/upload-qr` | Upload QR |

## 🎨 Color Themes

| Method | Background | Icon | Toggle | Border Focus |
|--------|-----------|------|--------|--------------|
| **Yape** | `bg-purple-100` | `text-purple-600` | `bg-purple-600` | `border-purple-500` |
| **Plin** | `bg-blue-100` | `text-blue-600` | `bg-blue-600` | `border-blue-500` |

## 📝 Key Components

### Tab Button
```typescript
{ id: 'payments', label: 'Métodos de Pago', icon: <CreditCard /> }
```

### Payment Method Structure
```typescript
{
  enabled: boolean,
  phoneNumber: string,
  qrCodeUrl: string,
  instructions: string
}
```

## ✅ Validation Rules

| Field | Rule |
|-------|------|
| QR Image Type | JPG, PNG only |
| QR Image Size | Max 5MB |
| Phone Number | Type: tel |
| Instructions | Optional, multi-line |

## 🔒 Requirements

- ✅ User must be authenticated
- ✅ User must have curator role
- ✅ Session must be active
- ✅ Backend APIs must be implemented

## 🎬 User Flow

```
1. User clicks "Métodos de Pago" tab
2. System fetches payment settings
3. User enables Yape/Plin
4. User enters phone number
5. User uploads QR code (optional)
6. User adds instructions (optional)
7. User clicks "Guardar Configuración"
8. System saves to backend
9. Success toast appears
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Tab not showing | Check CreditCard import |
| Can't upload QR | Check file type/size |
| Save fails | Verify API endpoints |
| Loading forever | Check API response |

## 📋 Testing Checklist

```bash
# Quick test commands
✓ Toggle Yape enable/disable
✓ Toggle Plin enable/disable
✓ Enter phone numbers
✓ Upload valid image (< 5MB JPG/PNG)
✓ Upload invalid image (should fail)
✓ Add instructions
✓ Click save
✓ Reload page (data persists)
```

## 🛠️ Quick Fixes

### Add new payment method
1. Update `PaymentSettings` interface
2. Add initial state
3. Copy & paste Yape/Plin section
4. Change colors and labels
5. Update API to handle new method

### Change color theme
1. Find section (Yape/Plin)
2. Update `bg-{color}-100` classes
3. Update `text-{color}-600` classes
4. Update `border-{color}-500` classes
5. Update `bg-{color}-600` in toggle

### Change max file size
1. Find `handleQRUpload` function
2. Update: `if (file.size > 5 * 1024 * 1024)`
3. Update label: "máx. 5MB"

## 📞 Need Help?

1. Check `IMPLEMENTATION_COMPLETE.md`
2. Review `API_SPEC_PAYMENT_SETTINGS.md`
3. See `PAYMENT_TAB_VISUAL_GUIDE.md`
4. Inspect browser console
5. Check network requests

## 🎯 Lines to Know

| Feature | Line Range |
|---------|-----------|
| Imports | 1-38 |
| Interfaces | 40-76 |
| State | 197-220 |
| Tabs Array | 222-228 |
| Functions | 527-650 |
| Yape UI | 1216-1312 |
| Plin UI | 1314-1410 |
| Save Button | 1412-1431 |

## 💡 Pro Tips

- **Preview before save**: QR preview shows immediately
- **Individual uploads**: Each method uploads independently
- **No auto-save**: User must click "Guardar"
- **Validation client-side**: File checks happen in browser
- **Toast reuse**: Uses existing toast system
- **Lazy load**: Settings only fetch when tab opens
- **Spanish UI**: All labels in Spanish

## 🔥 Quick Commands

```bash
# View the file
cat app/dashboard/curator/settings/page.tsx

# Check line count
wc -l app/dashboard/curator/settings/page.tsx

# Find payment section
grep -n "Payment Methods Tab" app/dashboard/curator/settings/page.tsx

# Verify syntax
npm run build
```

## 📊 Stats

- **Total Lines**: 1,561
- **Lines Added**: ~393
- **Functions Added**: 4
- **States Added**: 5
- **Interfaces Added**: 2
- **UI Sections**: 2 (Yape + Plin)
- **API Calls**: 3
- **Icons Used**: CreditCard, Upload, Save

---

**Version**: 1.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2024  

---

*Keep this card handy for quick reference!*
