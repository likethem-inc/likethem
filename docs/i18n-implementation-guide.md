# LikeThem - i18n Implementation Guide

## 📋 Executive Summary

This document provides a comprehensive overview of the current internationalization (i18n) implementation in LikeThem and identifies components that need translation.

---

## 🛠️ Current Implementation

### 1. **Library & Dependencies**

**Package.json Dependencies:**
```json
{
  "i18next": "^25.8.0",
  "react-i18next": "^16.5.4"
}
```

**Status:** ✅ Libraries installed but not fully integrated across the app.

---

### 2. **Configuration Files**

#### **Translation Storage Location:**
```
/locales
  ├── en/
  │   └── common.json
  └── es/
      └── common.json
```

#### **Core i18n Files:**
```
/lib/i18n/
  ├── t.ts           # Server-side translation function
  └── getLocale.ts   # Locale detection utility
```

#### **Client Components:**
```
/components/i18n/
  ├── I18nProvider.tsx      # Context provider for client
  └── LanguageSwitcher.tsx  # Language toggle UI
```

#### **Hooks:**
```
/hooks/
  └── useT.ts  # Client-side translation hook
```

---

### 3. **Supported Languages**

- **Spanish (ES)** - Default locale
- **English (EN)**

**Default Locale:** `es` (Spanish)

---

### 4. **How Translations Work**

#### **A. Server Components (App Router pages)**

```typescript
// Import utilities
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

// In async component
const locale = await getLocale()
const title = t(locale, 'explore.title')
const subtitle = t(locale, 'explore.subtitle')
```

**Example:** `/app/explore/page.tsx`

#### **B. Client Components**

```typescript
'use client'
import { useT } from '@/hooks/useT'

export default function MyComponent() {
  const t = useT()
  
  return (
    <div>
      <h1>{t('nav.dress')}</h1>
      <p>{t('explore.subtitle')}</p>
    </div>
  )
}
```

**Example:** `/components/Header.tsx`

#### **C. With Parameters (String Interpolation)**

```typescript
// Translation with params
t(locale, 'curator.noActiveDropDesc', { name: 'John' })
// Result: "John doesn't have an active drop right now."
```

**Translation file:**
```json
{
  "curator.noActiveDropDesc": "{name} doesn't have an active drop right now."
}
```

---

### 5. **Translation File Structure**

**File:** `/locales/en/common.json` and `/locales/es/common.json`

**Structure:** Flat key-value pairs with namespacing via dot notation

```json
{
  "nav.dress": "Dress Like Them",
  "nav.sell": "Sell Like Them",
  "nav.explore": "Explore",
  "nav.favorites": "Favorites",
  
  "auth.signIn": "Sign In",
  "auth.signIn.title": "Sign in",
  "auth.signIn.continueWithGoogle": "Continue with Google",
  
  "explore.title": "Discover Curators",
  "explore.subtitle": "Explore closets by the creators you admire.",
  
  "product.addToCart": "Add to cart",
  "product.outOfStock": "Out of stock",
  
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.save": "Save"
}
```

**Current Keys Count:** 246 translation keys in each language

**Namespaces:**
- `nav.*` - Navigation
- `auth.*` - Authentication
- `user.*` - User account
- `explore.*` - Explore page
- `curator.*` - Curator profiles
- `product.*` - Product pages
- `access.*` - Access modals
- `sell.*` - Sell page
- `common.*` - Common UI elements
- `admin.*` - Admin features
- `apply.*` - Application forms
- `about.*` - About page
- `wishlist.*` - Favorites/wishlist
- `account.*` - Account settings
- `payment.*` - Payment methods

---

### 6. **Locale Management**

#### **Cookie-based Persistence:**
- Cookie name: `likethem_locale`
- Max age: 1 year
- Path: `/`
- SameSite: `Lax`

#### **API Endpoint:**
```
POST /api/i18n/locale
Body: { "locale": "en" | "es" }
```

#### **Client-side Locale Change:**
The `LanguageSwitcher` component handles:
1. Update context state
2. Set cookie
3. Call API to sync with server
4. Refresh page to update server components

---

## 🔍 Components Analysis

### ✅ **Already Translated**

#### **Pages:**
1. **Explore Page** (`/app/explore/page.tsx`)
   - Title, subtitle, search placeholder
   - Filter labels
   - Sort options
   
2. **Apply Page** (`/app/apply/page.tsx`)
   - Form labels
   - Submission messages

3. **About Page** (inferred from translation keys)
   - Hero section
   - Story sections
   - Values and mission

#### **Components:**
1. **Header** (`/components/Header.tsx`)
   - Navigation links
   - User menu items

2. **Product Cards** (via translation keys)
   - Add to cart
   - Out of stock
   - Size, color, condition labels

3. **Auth Forms** (`/components/auth/*` - inferred)
   - Sign in/up forms
   - Error messages
   - Validation messages

4. **Access Modal** (via keys)
   - Modal content
   - Form labels

5. **Curator Profile** (via keys)
   - Tabs (General, Inner, Drops)
   - Empty states
   - Follow/unfollow buttons

---

### ❌ **Components NEEDING Translation**

Based on your requirements, here are the specific components that need translation work:

---

#### 🔴 **1. FOOTER** (`/components/Footer.tsx`)

**Current Status:** Hardcoded in English

**Needs Translation:**
```typescript
// Newsletter section
"Subscribe to our newsletter"
"Your email"

// Navigation sections
"Explore"
"Stores"
"Curators"
"Collections"
"Trending"

"Company"
"About us"
"Request access"
"Contact"
"Privacy"
"Terms of Service"

// Copyright
"© 2024 LikeThem. All rights reserved."
"The exclusive platform where influencers curate their fashion stores. Dress like the ones you admire."
```

**Suggested Translation Keys:**
```json
{
  "footer.newsletter.title": "Subscribe to our newsletter",
  "footer.newsletter.placeholder": "Your email",
  "footer.newsletter.button": "Subscribe",
  "footer.explore.title": "Explore",
  "footer.explore.stores": "Stores",
  "footer.explore.curators": "Curators",
  "footer.explore.collections": "Collections",
  "footer.explore.trending": "Trending",
  "footer.company.title": "Company",
  "footer.company.about": "About us",
  "footer.company.access": "Request access",
  "footer.company.contact": "Contact",
  "footer.company.privacy": "Privacy",
  "footer.company.terms": "Terms of Service",
  "footer.copyright": "© 2024 LikeThem. All rights reserved.",
  "footer.description": "The exclusive platform where influencers curate their fashion stores. Dress like the ones you admire."
}
```

---

#### 🔴 **2. HOME PAGE** (`/app/page.tsx`)

**Current Status:** Hardcoded

**Components needing translation:**

**a) Hero Section** (`/components/Hero.tsx`):
```typescript
"From your feed to your closet."
"Curated fashion by top influencers. Exclusive access to the pieces that matter."
"Discover Stores"
"Apply to Sell"
```

**b) Featured Curators Section**:
```typescript
"Featured Curators"
"Discover the most influential style curators in fashion."
"View all curators"
```

**Suggested Keys:**
```json
{
  "home.hero.title": "From your feed to your closet.",
  "home.hero.subtitle": "Curated fashion by top influencers. Exclusive access to the pieces that matter.",
  "home.hero.cta.discover": "Discover Stores",
  "home.hero.cta.apply": "Apply to Sell",
  "home.featured.title": "Featured Curators",
  "home.featured.subtitle": "Discover the most influential style curators in fashion.",
  "home.featured.cta": "View all curators"
}
```

---

#### 🔴 **3. HOME HEADER** (Already done ✅)

**Status:** `/components/Header.tsx` is already using translations via `useT()` hook

---

#### 🔴 **4. ACCOUNT PAGE** (`/app/account/AccountClient.tsx`)

**Current Status:** Hardcoded

**Needs Translation:**
```typescript
// Section titles
"Personal Details"
"Saved Items"
"Shipping Address"
"Payment Methods"
"Style Profile"

// Page header
"Account Information"
"Manage your personal details, preferences, and account settings"

// Address management
"Add New Address"
"Edit Address"
"Delete Address"
"Set as Default"
"Street Address"
"City"
"State / Province"
"ZIP / Postal Code"
"Country"
"Phone Number"

// Payment methods
"Add Payment Method"
"Card ending in ****"
"Expires"
"Default"

// Style preferences
"Preferred Styles"
"Sizes"
"Favorite Brands"
```

**Suggested Keys:**
```json
{
  "account.title": "Account Information",
  "account.subtitle": "Manage your personal details, preferences, and account settings",
  "account.sections.personal": "Personal Details",
  "account.sections.saved": "Saved Items",
  "account.sections.shipping": "Shipping Address",
  "account.sections.payment": "Payment Methods",
  "account.sections.style": "Style Profile",
  
  "account.address.add": "Add New Address",
  "account.address.edit": "Edit Address",
  "account.address.delete": "Delete Address",
  "account.address.setDefault": "Set as Default",
  "account.address.street": "Street Address",
  "account.address.city": "City",
  "account.address.state": "State / Province",
  "account.address.zipCode": "ZIP / Postal Code",
  "account.address.country": "Country",
  "account.address.phone": "Phone Number",
  
  "account.payment.add": "Add Payment Method",
  "account.payment.cardEnding": "Card ending in ****{last4}",
  "account.payment.expires": "Expires {month}/{year}",
  "account.payment.default": "Default",
  
  "account.style.preferred": "Preferred Styles",
  "account.style.sizes": "Sizes",
  "account.style.brands": "Favorite Brands"
}
```

---

#### 🔴 **5. ORDERS PAGE** (`/app/orders/page.tsx`)

**Current Status:** Partially hardcoded

**Needs Translation:**
```typescript
// Page header
"Your Orders"
"Track your purchases and view order details."

// Empty state
"No orders yet"
"You haven't placed any orders"
"Start shopping"

// Order list
"Order placed"
"Total"
"Ship to"
"Order #"
"View Order"
"Track Package"
"View Invoice"
"Buy Again"

// Status labels
"Pending Payment"
"Processing"
"Shipped"
"Delivered"
"Cancelled"
"Refunded"

// Pagination
"Previous"
"Next"
"Page {current} of {total}"
```

**Suggested Keys:**
```json
{
  "orders.title": "Your Orders",
  "orders.subtitle": "Track your purchases and view order details.",
  "orders.empty.title": "No orders yet",
  "orders.empty.description": "You haven't placed any orders",
  "orders.empty.cta": "Start shopping",
  
  "orders.item.placed": "Order placed",
  "orders.item.total": "Total",
  "orders.item.shipTo": "Ship to",
  "orders.item.orderNumber": "Order #{id}",
  "orders.item.view": "View Order",
  "orders.item.track": "Track Package",
  "orders.item.invoice": "View Invoice",
  "orders.item.buyAgain": "Buy Again",
  
  "orders.status.pendingPayment": "Pending Payment",
  "orders.status.processing": "Processing",
  "orders.status.shipped": "Shipped",
  "orders.status.delivered": "Delivered",
  "orders.status.cancelled": "Cancelled",
  "orders.status.refunded": "Refunded",
  
  "orders.pagination.previous": "Previous",
  "orders.pagination.next": "Next",
  "orders.pagination.info": "Page {current} of {total}"
}
```

---

#### 🔴 **6. CURATOR DASHBOARD - PRODUCTS** (`/app/dashboard/curator/products/page.tsx`)

**Current Status:** Hardcoded

**Needs Translation:**
```typescript
// Header
"My Products"
"Manage your curated collection ({count} products)"
"Manage Inventory"
"Add Product"

// Filters
"Search products..."
"All Status"
"Active"
"Inactive"
"Newest First"
"Oldest First"
"Price: High to Low"
"Price: Low to High"
"Name A-Z"

// Product cards
"Active"
"Inactive"
"{count} images"
"Edit"
"Delete"
"Change to Active"
"Change to Inactive"

// Empty state
"No products found"
"Try adjusting your search or filters"
"Start building your curated collection"
"Add Your First Product"

// Loading
"Loading products..."
"Error loading products"
"Try Again"
```

**Suggested Keys:**
```json
{
  "dashboard.products.title": "My Products",
  "dashboard.products.subtitle": "Manage your curated collection ({count} products)",
  "dashboard.products.inventory": "Manage Inventory",
  "dashboard.products.add": "Add Product",
  
  "dashboard.products.search": "Search products...",
  "dashboard.products.filter.all": "All Status",
  "dashboard.products.filter.active": "Active",
  "dashboard.products.filter.inactive": "Inactive",
  
  "dashboard.products.sort.newest": "Newest First",
  "dashboard.products.sort.oldest": "Oldest First",
  "dashboard.products.sort.priceHigh": "Price: High to Low",
  "dashboard.products.sort.priceLow": "Price: Low to High",
  "dashboard.products.sort.name": "Name A-Z",
  
  "dashboard.products.images": "{count} images",
  "dashboard.products.edit": "Edit",
  "dashboard.products.delete": "Delete",
  
  "dashboard.products.empty.title": "No products found",
  "dashboard.products.empty.filtered": "Try adjusting your search or filters",
  "dashboard.products.empty.initial": "Start building your curated collection",
  "dashboard.products.empty.cta": "Add Your First Product",
  
  "dashboard.products.loading": "Loading products...",
  "dashboard.products.error": "Error loading products",
  "dashboard.products.tryAgain": "Try Again"
}
```

---

#### 🔴 **7. CURATOR DASHBOARD - INVENTORY** (`/app/dashboard/curator/inventory/page.tsx`)

**Current Status:** Partially translated (uses `react-i18next` in some child components)

**Needs Translation:**
```typescript
// Page header
"Inventory Management"
"Manage stock levels for all your product variants"

// Tabs
"Inventory List"
"Manage Variants"
"Import/Export"

// Help section
"How Inventory Management Works"
"Variants Come From Products: Sizes and colors are defined when you create or edit a product..."
"Variant-Based Tracking: Inventory is tracked per size/color combination..."
"Stock Reservation: Stock is only reduced when an order is paid for..."
"Bulk Management: Use CSV import/export for managing large inventories..."
"Real-time Updates: Changes to stock levels are reflected immediately..."
```

**Suggested Keys:**
```json
{
  "dashboard.inventory.title": "Inventory Management",
  "dashboard.inventory.subtitle": "Manage stock levels for all your product variants",
  
  "dashboard.inventory.tabs.list": "Inventory List",
  "dashboard.inventory.tabs.variants": "Manage Variants",
  "dashboard.inventory.tabs.import": "Import/Export",
  
  "dashboard.inventory.help.title": "How Inventory Management Works",
  "dashboard.inventory.help.step1": "Variants Come From Products: Sizes and colors are defined when you create or edit a product. Use 'Edit product' to update sizes/colors, then return here to set stock and SKUs.",
  "dashboard.inventory.help.step2": "Variant-Based Tracking: Inventory is tracked per size/color combination, with stock and SKU managed here for each variant.",
  "dashboard.inventory.help.step3": "Stock Reservation: Stock is only reduced when an order is paid for, not when items are added to cart. This prevents overselling.",
  "dashboard.inventory.help.step4": "Bulk Management: Use CSV import/export for managing large inventories efficiently. Perfect for updating stock across multiple products at once.",
  "dashboard.inventory.help.step5": "Real-time Updates: Changes to stock levels are reflected immediately. Customers will see accurate availability when browsing."
}
```

---

#### 🔴 **8. CURATOR DASHBOARD - STORE** (`/app/dashboard/curator/store/page.tsx`)

**Current Status:** Hardcoded

**Needs Translation:**
```typescript
// Header
"Edit Store Profile"
"Update your store information and appearance"
"Back to Dashboard"
"Preview My Store"
"Editor's Pick"

// Sections
"Basic Information"
"Curator Display Name"
"Bio / Store Description"
"Location / City"
"Style Tags"
"Your store name"
"Tell visitors about your style and curation philosophy..."
"e.g., New York"
"e.g., minimal, oversized, neutral"
"{count}/280 characters"
"{count}/50 characters"

"Store Tags / Style Labels"
"Select tags that best describe your curation style"

"Social Media"
"@username"
"Channel URL"
"https://your-website.com"

"Store Settings"
"Store Status"
"Public - Visitors can browse your store"
"Private - Store is hidden from visitors"
"Editor's Pick"
"Featured curator status (admin controlled)"
"Active"
"Inactive"

// Sidebar
"Profile Picture"
"Crop to circle, display at 1:1 ratio"
"JPG, PNG up to 5MB"

"Banner Image"
"Recommended: 1440x400px"

"Badges"
"No badges yet. Keep curating to earn them!"

// Actions
"Save Changes"
"Saving..."
"Cancel"
"You have unsaved changes. Are you sure you want to leave?"

// Toast messages
"Profile updated successfully!"
"Failed to save profile"
"File size must be less than 5MB"
"Please upload a JPG, PNG, or WebP file"
"Failed to upload avatar image"
"Failed to upload banner image"
```

**Suggested Keys:**
```json
{
  "dashboard.store.title": "Edit Store Profile",
  "dashboard.store.subtitle": "Update your store information and appearance",
  "dashboard.store.back": "Back to Dashboard",
  "dashboard.store.preview": "Preview My Store",
  "dashboard.store.editorsPick": "Editor's Pick",
  
  "dashboard.store.basic.title": "Basic Information",
  "dashboard.store.basic.name": "Curator Display Name",
  "dashboard.store.basic.namePlaceholder": "Your store name",
  "dashboard.store.basic.bio": "Bio / Store Description",
  "dashboard.store.basic.bioPlaceholder": "Tell visitors about your style and curation philosophy...",
  "dashboard.store.basic.city": "Location / City",
  "dashboard.store.basic.cityPlaceholder": "e.g., New York",
  "dashboard.store.basic.styleTags": "Style Tags",
  "dashboard.store.basic.styleTagsPlaceholder": "e.g., minimal, oversized, neutral",
  "dashboard.store.basic.charsCount": "{count}/{max} characters",
  
  "dashboard.store.tags.title": "Store Tags / Style Labels",
  "dashboard.store.tags.description": "Select tags that best describe your curation style",
  
  "dashboard.store.social.title": "Social Media",
  "dashboard.store.social.username": "@username",
  "dashboard.store.social.channelUrl": "Channel URL",
  "dashboard.store.social.websiteUrl": "https://your-website.com",
  
  "dashboard.store.settings.title": "Store Settings",
  "dashboard.store.settings.status": "Store Status",
  "dashboard.store.settings.public": "Public - Visitors can browse your store",
  "dashboard.store.settings.private": "Private - Store is hidden from visitors",
  "dashboard.store.settings.editorsPick": "Editor's Pick",
  "dashboard.store.settings.editorsPickDesc": "Featured curator status (admin controlled)",
  "dashboard.store.settings.active": "Active",
  "dashboard.store.settings.inactive": "Inactive",
  
  "dashboard.store.avatar.title": "Profile Picture",
  "dashboard.store.avatar.description": "Crop to circle, display at 1:1 ratio",
  "dashboard.store.avatar.format": "JPG, PNG up to 5MB",
  
  "dashboard.store.banner.title": "Banner Image",
  "dashboard.store.banner.recommended": "Recommended: 1440x400px",
  "dashboard.store.banner.format": "JPG, PNG up to 5MB",
  
  "dashboard.store.badges.title": "Badges",
  "dashboard.store.badges.empty": "No badges yet. Keep curating to earn them!",
  
  "dashboard.store.actions.save": "Save Changes",
  "dashboard.store.actions.saving": "Saving...",
  "dashboard.store.actions.cancel": "Cancel",
  "dashboard.store.actions.unsaved": "You have unsaved changes. Are you sure you want to leave?",
  
  "dashboard.store.toast.success": "Profile updated successfully!",
  "dashboard.store.toast.error": "Failed to save profile",
  "dashboard.store.toast.fileSizeError": "File size must be less than 5MB",
  "dashboard.store.toast.fileTypeError": "Please upload a JPG, PNG, or WebP file",
  "dashboard.store.toast.avatarUploadError": "Failed to upload avatar image",
  "dashboard.store.toast.bannerUploadError": "Failed to upload banner image"
}
```

---

#### 🔴 **9. CURATOR DASHBOARD - ANALYTICS** (`/app/dashboard/curator/analytics/page.tsx`)

**Current Status:** Hardcoded

**Needs Translation:**
```typescript
// Header
"Analytics"
"Track your store performance and audience insights"
"Last 7 days"
"Last 30 days"
"Last 90 days"

// Metrics
"Total Store Visits"
"Items Favorited"
"Products Sold"
"Total Revenue"

// Sections
"Traffic Overview"
"Views"
"Favorites"
"Sales"

"Top Products"

"Top Cities"
"Device Usage"
"Mobile"
"Desktop"
"Tablet"

"Conversion Funnel"
"Store Visits"
"Favorites"
"Sales"
"Revenue"
"{value} avg"
```

**Suggested Keys:**
```json
{
  "dashboard.analytics.title": "Analytics",
  "dashboard.analytics.subtitle": "Track your store performance and audience insights",
  
  "dashboard.analytics.period.7d": "Last 7 days",
  "dashboard.analytics.period.30d": "Last 30 days",
  "dashboard.analytics.period.90d": "Last 90 days",
  
  "dashboard.analytics.metrics.visits": "Total Store Visits",
  "dashboard.analytics.metrics.favorited": "Items Favorited",
  "dashboard.analytics.metrics.sold": "Products Sold",
  "dashboard.analytics.metrics.revenue": "Total Revenue",
  
  "dashboard.analytics.traffic.title": "Traffic Overview",
  "dashboard.analytics.traffic.views": "Views",
  "dashboard.analytics.traffic.favorites": "Favorites",
  "dashboard.analytics.traffic.sales": "Sales",
  
  "dashboard.analytics.topProducts.title": "Top Products",
  "dashboard.analytics.topProducts.views": "{count} views",
  "dashboard.analytics.topProducts.favorites": "{count} fav",
  "dashboard.analytics.topProducts.sales": "{count} sales",
  
  "dashboard.analytics.cities.title": "Top Cities",
  "dashboard.analytics.devices.title": "Device Usage",
  "dashboard.analytics.devices.mobile": "Mobile",
  "dashboard.analytics.devices.desktop": "Desktop",
  "dashboard.analytics.devices.tablet": "Tablet",
  
  "dashboard.analytics.funnel.title": "Conversion Funnel",
  "dashboard.analytics.funnel.visits": "Store Visits",
  "dashboard.analytics.funnel.favorites": "Favorites",
  "dashboard.analytics.funnel.sales": "Sales",
  "dashboard.analytics.funnel.revenue": "Revenue",
  "dashboard.analytics.funnel.average": "${value} avg"
}
```

---

#### 🔴 **10. ORDER CONFIRMATION PAGE** (`/app/order-confirmation/page.tsx`)

**Current Status:** Hardcoded

**Needs Translation:**
```typescript
// Status messages
"Payment Pending"
"Your order has been submitted and is waiting for payment confirmation."
"Payment Confirmed"
"Your payment has been confirmed and your order is being processed."
"Payment Rejected"
"Your payment was not verified. Please contact support for assistance."
"Order Confirmed"
"Your order has been successfully placed and is being processed."

// Order details
"Order Details"
"Order Information"
"Order ID:"
"Date:"
"Status:"
"Total:"

"Shipping Address"
"Items Ordered"
"Qty: {quantity}"
"Size: {size}"
"Color: {color}"

// Next steps
"Next Steps"
"Complete your payment using the method you selected"
"Upload payment proof if you haven't already"
"Wait for payment verification (usually within 24 hours)"
"You'll receive an email confirmation once payment is verified"

"What's Next?"
"Your order is being prepared for shipment"
"You'll receive tracking information via email"
"Expected delivery: 3-5 business days"

// Actions
"View My Orders"
"Continue Shopping"

// Support
"Need help? Contact us at"
```

**Suggested Keys:**
```json
{
  "orderConfirmation.status.pending.title": "Payment Pending",
  "orderConfirmation.status.pending.description": "Your order has been submitted and is waiting for payment confirmation.",
  "orderConfirmation.status.paid.title": "Payment Confirmed",
  "orderConfirmation.status.paid.description": "Your payment has been confirmed and your order is being processed.",
  "orderConfirmation.status.rejected.title": "Payment Rejected",
  "orderConfirmation.status.rejected.description": "Your payment was not verified. Please contact support for assistance.",
  "orderConfirmation.status.default.title": "Order Confirmed",
  "orderConfirmation.status.default.description": "Your order has been successfully placed and is being processed.",
  
  "orderConfirmation.details.title": "Order Details",
  "orderConfirmation.details.orderInfo": "Order Information",
  "orderConfirmation.details.orderId": "Order ID:",
  "orderConfirmation.details.date": "Date:",
  "orderConfirmation.details.status": "Status:",
  "orderConfirmation.details.total": "Total:",
  
  "orderConfirmation.shipping.title": "Shipping Address",
  "orderConfirmation.items.title": "Items Ordered",
  "orderConfirmation.items.quantity": "Qty: {quantity}",
  "orderConfirmation.items.size": "Size: {size}",
  "orderConfirmation.items.color": "Color: {color}",
  
  "orderConfirmation.nextSteps.pending.title": "Next Steps",
  "orderConfirmation.nextSteps.pending.step1": "Complete your payment using the method you selected",
  "orderConfirmation.nextSteps.pending.step2": "Upload payment proof if you haven't already",
  "orderConfirmation.nextSteps.pending.step3": "Wait for payment verification (usually within 24 hours)",
  "orderConfirmation.nextSteps.pending.step4": "You'll receive an email confirmation once payment is verified",
  
  "orderConfirmation.nextSteps.paid.title": "What's Next?",
  "orderConfirmation.nextSteps.paid.step1": "Your order is being prepared for shipment",
  "orderConfirmation.nextSteps.paid.step2": "You'll receive tracking information via email",
  "orderConfirmation.nextSteps.paid.step3": "Expected delivery: 3-5 business days",
  
  "orderConfirmation.actions.viewOrders": "View My Orders",
  "orderConfirmation.actions.continueShopping": "Continue Shopping",
  
  "orderConfirmation.support": "Need help? Contact us at",
  "orderConfirmation.supportEmail": "support@likethem.com"
}
```

---

#### 🔴 **11. FAVORITES PAGE** (`/app/favorites/page.tsx`)

**Current Status:** Partially hardcoded

**Needs Translation:**
```typescript
// Page header
"Your Favorites"
"Save your favorite looks, outfits, and curators here for quick access."

// From SavedItems component (inferred)
"No saved items"
"You haven't saved anything yet"
"Browse products"
"Remove from favorites"
"Add to cart"
"{count} item"
"{count} items"
```

**Suggested Keys:**
```json
{
  "favorites.title": "Your Favorites",
  "favorites.subtitle": "Save your favorite looks, outfits, and curators here for quick access.",
  "favorites.empty.title": "No saved items",
  "favorites.empty.description": "You haven't saved anything yet",
  "favorites.empty.cta": "Browse products",
  "favorites.remove": "Remove from favorites",
  "favorites.addToCart": "Add to cart",
  "favorites.count.single": "{count} item",
  "favorites.count.multiple": "{count} items"
}
```

---

## 🎯 Implementation Priority

### **Phase 1: Critical (High Visibility)**
1. ✅ Header (Done)
2. 🔴 Footer
3. 🔴 Home Page (Hero + Featured)
4. 🔴 Orders Page
5. 🔴 Order Confirmation

### **Phase 2: User Features**
6. 🔴 Account Page
7. 🔴 Favorites Page

### **Phase 3: Curator Dashboard**
8. 🔴 Products Page
9. 🔴 Inventory Page
10. 🔴 Store Settings
11. 🔴 Analytics

---

## 📝 Implementation Checklist

### **For Each Component:**

- [ ] Identify all hardcoded strings
- [ ] Define translation keys following naming convention
- [ ] Add keys to `/locales/en/common.json`
- [ ] Add keys to `/locales/es/common.json`
- [ ] Refactor component to use:
  - Server components: `t(locale, 'key')`
  - Client components: `const t = useT()` then `t('key')`
- [ ] Test language switching
- [ ] Verify parameter interpolation works
- [ ] Check for missing translations in dev console

---

## 🚀 Quick Start Guide

### **1. Add New Translation Keys**

Edit both `/locales/en/common.json` and `/locales/es/common.json`:

```json
{
  "myComponent.title": "My Title",
  "myComponent.description": "Description with {param}"
}
```

### **2. Use in Server Component**

```typescript
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export default async function MyPage() {
  const locale = await getLocale()
  
  return (
    <div>
      <h1>{t(locale, 'myComponent.title')}</h1>
      <p>{t(locale, 'myComponent.description', { param: 'value' })}</p>
    </div>
  )
}
```

### **3. Use in Client Component**

```typescript
'use client'
import { useT } from '@/hooks/useT'

export default function MyComponent() {
  const t = useT()
  
  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description', { param: 'value' })}</p>
    </div>
  )
}
```

---

## 🔧 Available Tools

### **Hooks:**
- `useT()` - Client-side translations
- `useLocale()` - Get current locale
- `useSetLocale()` - Change locale programmatically

### **Server Functions:**
- `getLocale()` - Get current locale (async)
- `t(locale, key, params?)` - Translate key
- `getTranslations(locale)` - Get all translations for locale

### **Components:**
- `<LanguageSwitcher />` - Language dropdown UI

---

## 📊 Translation Coverage

**Current Coverage:**
- ✅ Auth flows (100%)
- ✅ Explore page (100%)
- ✅ Product pages (100%)
- ✅ Curator profiles (100%)
- ✅ Apply forms (100%)
- ✅ About page (100%)
- ✅ Access modals (100%)
- ✅ Admin features (100%)
- ⚠️ Footer (0%)
- ⚠️ Home page (0%)
- ⚠️ Account page (0%)
- ⚠️ Orders page (10%)
- ⚠️ Dashboard pages (0%)
- ⚠️ Order confirmation (0%)

**Total Keys:** 246 keys
**Components Using Translations:** ~30%
**Components Needing Work:** ~70%

---

## 🎨 Best Practices

1. **Always use namespacing:** `section.subsection.key`
2. **Keep keys descriptive:** `dashboard.products.empty.title` not `dash.prod.empt`
3. **Use parameters for dynamic content:** `{name}`, `{count}`, etc.
4. **Test both languages** after adding translations
5. **Check dev console** for missing translation warnings
6. **Group related keys** under same namespace
7. **Use common.* for reusable UI elements**

---

## 🐛 Common Issues

### **Issue 1: "Missing translation key" warnings**
**Solution:** Add the key to both EN and ES translation files

### **Issue 2: Server/client component mismatch**
**Solution:** 
- Server components: Use `t(locale, key)`
- Client components: Use `const t = useT(); t(key)`

### **Issue 3: Parameters not working**
**Solution:** Use curly braces in translation file: `"key": "Text {param}"`

### **Issue 4: Locale not persisting**
**Solution:** Check cookie is being set correctly and API endpoint is working

---

## 📚 Additional Resources

- Translation files: `/locales/{lang}/common.json`
- i18n utilities: `/lib/i18n/`
- Client provider: `/components/i18n/I18nProvider.tsx`
- Language switcher: `/components/i18n/LanguageSwitcher.tsx`
- Hook: `/hooks/useT.ts`

---

**Last Updated:** 2024-02-10
**Maintainer:** LikeThem Development Team
