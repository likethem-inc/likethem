# Translation Integration Guide

## Overview
This guide provides the new translation keys needed for internationalizing the LikeThem application components.

## Generated Files
- `/locales/en/new-translations.json` - English translations
- `/locales/es/new-translations.json` - Spanish translations

## Components Covered

### 1. **Footer** (components/Footer.tsx)
**Namespace:** `footer.*`
- Footer description
- Newsletter subscription
- Navigation sections (Explore, Company)
- Copyright notice

**Keys:** 17 total

---

### 2. **Hero** (components/Hero.tsx)
**Namespace:** `hero.*`
- Main hero title and subtitle
- Call-to-action buttons
- Image alt text

**Keys:** 5 total

---

### 3. **Home Page** (app/page.tsx + CuratorsSectionPeek)
**Namespace:** `home.*`
- Featured curators section
- Section titles and subtitles
- CTA labels

**Keys:** 3 total

---

### 4. **Favorites Page** (app/favorites/page.tsx)
**Namespace:** `favorites.*`
- Page title and subtitle

**Keys:** 2 total

---

### 5. **Account Page** (app/account/AccountClient.tsx)
**Namespace:** `account.*`
- Section titles (Personal Details, Shipping, Payment, Style Profile)
- Personal information form fields
- Password change functionality
- Shipping address management
- Payment methods
- Style preferences

**Keys:** 50+ total
- `account.title`, `account.subtitle`
- `account.sections.*` (5 sections)
- `account.personal.*` (30+ fields including password management)
- `account.shipping.*` (7 fields)
- `account.payment.*` (4 fields)
- `account.style.*` (3 fields)

---

### 6. **Orders Page** (app/orders/page.tsx)
**Namespace:** `orders.*`
- Orders list page
- Empty state
- Pagination
- Order card details

**Keys:** 10 total

---

### 7. **Order Confirmation** (app/order-confirmation/page.tsx)
**Namespace:** `orderConfirmation.*`
- Payment status messages (Pending, Confirmed, Rejected)
- Order details display
- Shipping information
- Next steps instructions
- Action buttons
- Support contact

**Keys:** 30+ total
- Status titles and descriptions (4 statuses)
- Order information fields (4 fields)
- Items ordered display (3 fields)
- Next steps (8 steps)
- Actions and support (4 fields)

---

### 8. **Products Dashboard** (app/dashboard/curator/products/page.tsx)
**Namespace:** `dashboard.products.*`
- Product management interface
- Search and filters
- Sort options
- Product cards
- Empty states

**Keys:** 18 total

---

### 9. **Inventory Dashboard** (app/dashboard/curator/inventory/page.tsx)
**Namespace:** `dashboard.inventory.*`
- Inventory management tabs
- Stock level tracking
- Variant management
- Import/Export functionality

**Keys:** 15 total

---

### 10. **Store Settings** (app/dashboard/curator/store/page.tsx)
**Namespace:** `dashboard.store.*`
- Profile images (avatar, banner)
- Basic information (name, bio, location, style)
- Store visibility settings
- Social links
- Style tags
- Badges
- Save/cancel actions

**Keys:** 35+ total

---

### 11. **Analytics Dashboard** (app/dashboard/curator/analytics/page.tsx)
**Namespace:** `dashboard.analytics.*`
- Time range filters
- Key metrics (visits, favorites, sales, revenue)
- Top products
- Demographics (cities, devices)
- Traffic overview
- Empty states

**Keys:** 25+ total

---

### 12. **Curator Orders** (app/dashboard/curator/orders/page.tsx)
**Namespace:** `dashboard.orders.*`
- Order status filters
- Order cards with details
- Shipping information form
- Order actions (approve, reject, ship, deliver)
- Status badges
- Empty states

**Keys:** 40+ total

---

## Integration Instructions

### Step 1: Merge Translations
Copy the contents of each new translation file into the corresponding existing files:

```bash
# Backup existing files first
cp locales/en/common.json locales/en/common.json.backup
cp locales/es/common.json locales/es/common.json.backup

# Then manually merge the new keys from:
# - locales/en/new-translations.json → locales/en/common.json
# - locales/es/new-translations.json → locales/es/common.json
```

### Step 2: Update Components
Replace hardcoded strings in each component with translation keys using the `useTranslation` hook:

#### Example (Footer.tsx):
```tsx
'use client'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="bg-carbon text-white py-16">
      <div className="container-custom">
        <p className="text-gray-300 text-sm">
          {t('footer.description')}
        </p>
        <h4 className="font-medium mb-3">
          {t('footer.newsletter.title')}
        </h4>
        {/* ... more translations */}
      </div>
    </footer>
  )
}
```

#### Example (Orders Page):
```tsx
'use client'
import { useTranslation } from 'react-i18next'

export default function OrdersPage() {
  const { t } = useTranslation()
  
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-3xl font-semibold">
        {t('orders.title')}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {t('orders.subtitle')}
      </p>
      {/* ... */}
    </div>
  )
}
```

### Step 3: Handle Interpolation
For dynamic values, use interpolation:

```tsx
// Example: orders.page with count
<p>{t('orders.items', { count: 5 })}</p>
// Outputs: "5 items"

// Example: pagination
<div>{t('orders.page', { page: 1, total: 10 })}</div>
// Outputs: "Page 1 of 10"
```

### Step 4: Test Each Language
Switch between languages and verify:
1. All text renders correctly
2. Layout doesn't break with longer translations
3. Interpolated values work
4. Pluralization works correctly

---

## Translation Naming Conventions

All translations follow these patterns:

### Namespace Structure:
```
component.section.element
```

Examples:
- `footer.newsletter.title`
- `account.personal.fullName`
- `dashboard.orders.status.shipped`

### Common Patterns:
- **Titles:** `.title`
- **Subtitles/Descriptions:** `.subtitle`, `.description`
- **Placeholders:** `.placeholder` or `Placeholder` suffix
- **Actions:** `.save`, `.cancel`, `.edit`, `.delete`
- **States:** `.loading`, `.error`, `.success`, `.empty`
- **Status:** `.status.*` (pendingPayment, paid, shipped, etc.)
- **Errors:** `.error.*` or `Error` suffix

---

## Key Statistics

| Component | Namespace | Key Count (approx) |
|-----------|-----------|-------------------|
| Footer | `footer.*` | 17 |
| Hero | `hero.*` | 5 |
| Home | `home.*` | 3 |
| Favorites | `favorites.*` | 2 |
| Account | `account.*` | 50+ |
| Orders | `orders.*` | 10 |
| Order Confirmation | `orderConfirmation.*` | 30+ |
| Dashboard Products | `dashboard.products.*` | 18 |
| Dashboard Inventory | `dashboard.inventory.*` | 15 |
| Dashboard Store | `dashboard.store.*` | 35+ |
| Dashboard Analytics | `dashboard.analytics.*` | 25+ |
| Dashboard Orders | `dashboard.orders.*` | 40+ |
| **TOTAL** | | **~250 keys** |

---

## Style and Tone Guidelines

The translations maintain the LikeThem brand voice:

### English:
- **Tone:** Exclusive, sophisticated, direct
- **Style:** Clean, minimal, fashion-forward
- **Voice:** Second person ("Your", "You")
- **Vocabulary:** Premium, curated, exclusive, influencer-focused

### Spanish:
- **Tone:** Exclusivo, sofisticado, directo
- **Style:** Limpio, minimal, vanguardista
- **Voice:** Formal "tú" (except professional contexts)
- **Vocabulary:** Premium, curado, exclusivo, enfocado en influencers

---

## Priority Components for Implementation

### Phase 1 (User-Facing - High Priority):
1. ✅ Footer
2. ✅ Hero
3. ✅ Home page
4. ✅ Favorites
5. ✅ Orders
6. ✅ Order Confirmation

### Phase 2 (Account Management - Medium Priority):
1. ✅ Account settings
2. ✅ Personal details
3. ✅ Shipping addresses
4. ✅ Payment methods

### Phase 3 (Curator Dashboard - Medium Priority):
1. ✅ Products management
2. ✅ Inventory management
3. ✅ Store settings
4. ✅ Analytics
5. ✅ Order fulfillment

---

## Testing Checklist

- [ ] All components render in English
- [ ] All components render in Spanish
- [ ] Language switcher works
- [ ] No missing translation warnings
- [ ] Interpolated values display correctly
- [ ] Pluralization works (items vs item)
- [ ] Long text doesn't break layouts
- [ ] RTL support (if needed)
- [ ] Mobile responsive with translations
- [ ] Toast/notification messages translated

---

## Additional Notes

### Missing Components:
These components likely need translations but weren't analyzed:
- Product detail page sections
- Cart page
- Checkout flow
- Search/filters
- Authentication flows (partially covered)
- Error pages

### Dynamic Content:
Some content comes from the database and shouldn't be translated:
- Product names
- Curator bios (user-generated)
- Product descriptions
- User reviews/comments

### Future Considerations:
- Add more languages (Portuguese, French)
- Implement right-to-left (RTL) support for Arabic, Hebrew
- Consider regional variations (es-MX vs es-ES)
- Add context-specific translations for ambiguous terms

---

## Support

For questions about integration or translation keys:
1. Check this guide first
2. Search the codebase for similar implementations
3. Refer to the i18next documentation
4. Contact the dev team

---

**Generated:** 2024
**Version:** 1.0
**Status:** Ready for Integration
