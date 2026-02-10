# Translation Testing Guide

## Overview
This guide helps you test all the translations implemented across the LikeThem website.

## Quick Start

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Open the website**
   ```
   http://localhost:3000
   ```

3. **Switch Languages**
   - Look for the language selector in the header (usually top-right)
   - Toggle between English (EN) and Spanish (ES)

## Pages to Test

### 1. Footer (All Pages)
**Location**: Bottom of every page

**What to Check**:
- ✅ Newsletter section title and placeholder
- ✅ Explore menu items
- ✅ Company menu items
- ✅ Copyright text

**Test**: Switch language and verify all footer text changes

---

### 2. Home Page
**URL**: `http://localhost:3000`

**What to Check**:
- ✅ Hero title: "From your feed to your closet"
- ✅ Hero subtitle
- ✅ "Discover Stores" button
- ✅ "Apply to Sell" button
- ✅ "Featured Curators" section title and subtitle
- ✅ "View all curators" CTA button

**Test**: Navigate to home, switch language, verify all text changes

---

### 3. Favorites Page
**URL**: `http://localhost:3000/favorites`

**What to Check**:
- ✅ Page title: "Your Favorites"
- ✅ Page subtitle/description

**Test**: Must be logged in to access

---

### 4. Orders Page
**URL**: `http://localhost:3000/orders`

**What to Check**:
- ✅ Page title: "Your Orders"
- ✅ Page subtitle: "Track your purchases..."
- ✅ Pagination controls: "Previous", "Next", "Page X of Y"
- ✅ Empty state message (if no orders)

**Test**: Must be logged in to access

---

### 5. Order Confirmation Page
**URL**: `http://localhost:3000/order-confirmation?orderId=XXX&status=PAID`

**What to Check**:
- ✅ Status titles (Payment Pending, Confirmed, Rejected)
- ✅ Status descriptions
- ✅ Order Details section
- ✅ Order Information labels (Order ID, Date, Status, Total)
- ✅ Shipping Address section
- ✅ Items Ordered section with quantity, size, color
- ✅ Next Steps instructions
- ✅ Action buttons ("View My Orders", "Continue Shopping")
- ✅ Support contact text

**Test**: 
1. Complete an order or use a test orderId
2. Switch language
3. Verify all status messages, labels, and buttons change

---

### 6. Account Page
**URL**: `http://localhost:3000/account`

**What to Check**:
- ✅ Page title: "Account Information"
- ✅ Section tabs: Personal Details, Saved Items, Shipping Address, Payment Methods, Style Profile
- ✅ Personal Details form labels and placeholders
- ✅ Password change form
- ✅ Success/error messages
- ✅ Button labels: "Edit", "Save Changes", "Cancel"

**Test**: Must be logged in
1. Navigate to account page
2. Switch language
3. Try editing personal details
4. Verify form labels, placeholders, and messages change

---

### 7. Dashboard - Products
**URL**: `http://localhost:3000/dashboard/curator/products`

**What to Check**:
- ✅ Page title: "My Products"
- ✅ Page subtitle with product count
- ✅ "Add Product" and "Manage Inventory" buttons
- ✅ Search placeholder: "Search products..."
- ✅ Filter options: "All Status", "Active", "Inactive"
- ✅ Sort options: "Newest First", "Oldest First", etc.
- ✅ Status badges: "Active", "Inactive"
- ✅ Empty state message
- ✅ Loading message
- ✅ Error messages

**Test**: Must be logged in as curator
1. Navigate to products page
2. Switch language
3. Try searching and filtering
4. Verify all UI text changes

---

### 8. Dashboard - Inventory
**URL**: `http://localhost:3000/dashboard/curator/inventory`

**What to Check**:
- ✅ Page title: "Inventory Management"
- ✅ Page subtitle
- ✅ Tab names: "Inventory List", "Manage Variants", "Import/Export"
- ✅ Help section (keep in English/Spanish as-is)

**Test**: Must be logged in as curator
1. Navigate to inventory page
2. Switch language
3. Click through different tabs
4. Verify tab names and headers change

---

### 9. Dashboard - Store Settings
**URL**: `http://localhost:3000/dashboard/curator/store`

**What to Check**:
- ✅ Page title: "Edit Store Profile"
- ✅ Section titles: "Basic Information", "Store Tags", "Social Links", "Store Settings"
- ✅ Form labels: "Curator Display Name", "Bio", "City", "Style Tags"
- ✅ Placeholder text in all input fields
- ✅ Character counters: "50/50 characters"
- ✅ Button labels: "Save Changes", "Cancel", "Preview Store"
- ✅ Success/error toast messages
- ✅ Unsaved changes warning

**Test**: Must be logged in as curator
1. Navigate to store settings
2. Switch language
3. Try editing different fields
4. Verify all labels, placeholders, and messages change

---

### 10. Dashboard - Analytics
**URL**: `http://localhost:3000/dashboard/curator/analytics`

**What to Check**:
- ✅ Page title: "Analytics"
- ✅ Page subtitle
- ✅ Time range options: "Last 7 days", "Last 30 days", "Last 90 days"
- ✅ Metric labels: "Total Store Visits", "Items Favorited", "Products Sold", "Total Revenue"
- ✅ Section titles: "Top Products", "Audience Demographics"
- ✅ Table headers and labels
- ✅ Empty state message

**Test**: Must be logged in as curator
1. Navigate to analytics page
2. Switch language
3. Change time range
4. Verify all metric labels and section titles change

---

### 11. Dashboard - Orders
**URL**: `http://localhost:3000/dashboard/curator/orders`

**What to Check**:
- ✅ Page title: "Orders"
- ✅ Page subtitle
- ✅ Filter buttons: "All Orders", "Pending Payment", "Paid", "Processing", etc.
- ✅ Order card labels: "Order ID", "Customer", "Email", "Date", "Items", "Total"
- ✅ Status labels with correct formatting
- ✅ Action buttons: "Approve Payment", "Reject Payment", "Add Shipping Info", etc.
- ✅ Shipping form labels and placeholders
- ✅ Success/error messages

**Test**: Must be logged in as curator
1. Navigate to orders page
2. Switch language
3. Click different status filters
4. Try to update an order
5. Verify all labels, buttons, and messages change

---

## Common Issues to Look For

### 1. Missing Translations
**Symptom**: Text remains in English when switched to Spanish (or vice versa)

**What to check**:
- Open browser console (F12)
- Look for warnings like: "Translation key not found: xyz"
- Report the missing key

### 2. Broken Parameter Interpolation
**Symptom**: Text shows `{param}` instead of actual value

**Example**: "Page {page} of {total}" shows literally instead of "Page 1 of 5"

**What to check**:
- Verify the dynamic values are being passed correctly
- Check console for errors

### 3. Layout Issues
**Symptom**: Text overlaps or wraps unexpectedly in one language

**What to check**:
- Spanish text is typically 20-30% longer than English
- Verify buttons and containers accommodate longer text
- Check responsive design on mobile

### 4. Incorrect Capitalization
**Symptom**: Spanish text uses English capitalization rules

**What to check**:
- In Spanish, only first word of titles is capitalized (except proper nouns)
- "Your Orders" → "Tus pedidos" (not "Tus Pedidos")

## Testing Checklist

### Before Starting
- [ ] Development server is running
- [ ] You're logged in (for protected pages)
- [ ] You have curator access (for dashboard pages)
- [ ] Browser console is open to catch warnings

### For Each Page
- [ ] Navigate to the page
- [ ] Switch to English - verify all text is in English
- [ ] Switch to Spanish - verify all text is in Spanish
- [ ] Interact with forms/buttons - verify messages are translated
- [ ] Check for console warnings or errors
- [ ] Test on mobile viewport (responsive design)

### Final Verification
- [ ] All 12 pages tested in both languages
- [ ] No console warnings about missing keys
- [ ] No `{param}` showing in text (parameter interpolation works)
- [ ] No layout issues with longer Spanish text
- [ ] Forms and interactions work correctly in both languages

## Reporting Issues

If you find any issues, please provide:

1. **Page URL**: Where you found the issue
2. **Language**: Which language has the problem (EN or ES)
3. **Screenshot**: Visual proof of the issue
4. **Expected**: What should appear
5. **Actual**: What actually appears
6. **Console Errors**: Any errors/warnings in browser console

## Translation Keys Reference

All translation keys are stored in:
- `/locales/en/common.json` - English translations (511 keys)
- `/locales/es/common.json` - Spanish translations (511 keys)

Keys are organized by namespace:
- `footer.*` - Footer component
- `hero.*` - Hero section
- `home.*` - Home page
- `favorites.*` - Favorites page
- `account.*` - Account page
- `orders.*` - Orders page
- `orderConfirmation.*` - Order confirmation page
- `dashboard.products.*` - Products dashboard
- `dashboard.inventory.*` - Inventory dashboard
- `dashboard.store.*` - Store settings
- `dashboard.analytics.*` - Analytics dashboard
- `dashboard.orders.*` - Orders dashboard

## Success Criteria

✅ **All pages display correctly in both English and Spanish**
✅ **Language switching works instantly with no page reload**
✅ **All form labels, placeholders, buttons, and messages are translated**
✅ **Parameter interpolation works (no `{param}` showing in text)**
✅ **No console warnings about missing translation keys**
✅ **Layout accommodates longer Spanish text without breaking**
✅ **All interactive features work correctly in both languages**

## Need Help?

Check the documentation:
- `TRANSLATION-INDEX.md` - Master documentation index
- `TRANSLATION-QUICK-REFERENCE.md` - Quick reference guide
- `TRANSLATION-COMPLETION-SUMMARY.md` - Project summary

---

**Happy Testing!** 🎉
