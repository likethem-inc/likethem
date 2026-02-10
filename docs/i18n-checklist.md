# 🎯 LikeThem i18n Implementation Checklist

Use this checklist to track your progress implementing translations across the website.

## 📋 Phase 1: Critical Components (Priority: HIGH)

### 1. Footer Component
- [ ] File: `/components/Footer.tsx`
- [ ] Add 15 translation keys to both language files
- [ ] Import `useT()` hook
- [ ] Replace all hardcoded strings
- [ ] Test language switching
- [ ] Verify newsletter section
- [ ] Verify navigation links
- [ ] Verify copyright text

**Translation Keys:** `footer.*` (15 keys)  
**Time Estimate:** 30 minutes  
**Difficulty:** ⭐ Easy

---

### 2. Home Page Hero
- [ ] File: `/components/Hero.tsx`
- [ ] Add 4 translation keys
- [ ] Convert to client component if needed (currently 'use client')
- [ ] Import `useT()` hook
- [ ] Replace hero title and subtitle
- [ ] Replace CTA button labels
- [ ] Test on both languages

**Translation Keys:** `home.hero.*` (4 keys)  
**Time Estimate:** 20 minutes  
**Difficulty:** ⭐ Easy

---

### 3. Home Page Featured Section
- [ ] File: `/app/page.tsx` or `/components/curators/CuratorsSectionPeek.tsx`
- [ ] Add 3 translation keys
- [ ] Convert to use server-side translation if needed
- [ ] Replace section title and subtitle
- [ ] Replace CTA label
- [ ] Test layout with both languages

**Translation Keys:** `home.featured.*` (3 keys)  
**Time Estimate:** 15 minutes  
**Difficulty:** ⭐ Easy

---

### 4. Orders Page
- [ ] File: `/app/orders/page.tsx`
- [ ] File: `/components/orders/OrderListItem.tsx` (if exists)
- [ ] File: `/components/orders/EmptyOrders.tsx` (if exists)
- [ ] Add 18 translation keys
- [ ] Import server translation utils (`getLocale`, `t`)
- [ ] Replace page header
- [ ] Replace status labels
- [ ] Replace pagination text
- [ ] Replace empty state
- [ ] Test with orders and without orders

**Translation Keys:** `orders.*` (18 keys)  
**Time Estimate:** 45 minutes  
**Difficulty:** ⭐⭐ Medium

---

### 5. Order Confirmation Page
- [ ] File: `/app/order-confirmation/page.tsx`
- [ ] Add 25 translation keys
- [ ] Already 'use client', use `useT()` hook
- [ ] Replace all status messages
- [ ] Replace order details section
- [ ] Replace next steps instructions
- [ ] Replace action buttons
- [ ] Test all status variations (PENDING, PAID, REJECTED)

**Translation Keys:** `orderConfirmation.*` (25 keys)  
**Time Estimate:** 60 minutes  
**Difficulty:** ⭐⭐⭐ Medium-High

---

## 📋 Phase 2: User Account Features (Priority: MEDIUM)

### 6. Account Page
- [ ] File: `/app/account/AccountClient.tsx`
- [ ] Add 25 translation keys
- [ ] Already 'use client', use `useT()` hook
- [ ] Replace section titles
- [ ] Replace page header and subtitle
- [ ] Replace address form labels
- [ ] Replace payment method labels
- [ ] Replace style profile labels
- [ ] Test accordion expand/collapse
- [ ] Test form interactions

**Translation Keys:** `account.*` (25 keys)  
**Time Estimate:** 90 minutes  
**Difficulty:** ⭐⭐⭐ High

---

### 7. Favorites Page
- [ ] File: `/app/favorites/page.tsx`
- [ ] File: `/components/account/SavedItems.tsx` (if exists)
- [ ] Add 8 translation keys
- [ ] Convert to server component or use appropriate method
- [ ] Replace page header
- [ ] Replace empty state
- [ ] Replace action buttons
- [ ] Test with and without saved items

**Translation Keys:** `favorites.*` (8 keys)  
**Time Estimate:** 30 minutes  
**Difficulty:** ⭐⭐ Easy-Medium

---

## 📋 Phase 3: Curator Dashboard (Priority: MEDIUM-LOW)

### 8. Dashboard - Products Page
- [ ] File: `/app/dashboard/curator/products/page.tsx`
- [ ] Add 20 translation keys
- [ ] Already 'use client', use `useT()` hook
- [ ] Replace page header
- [ ] Replace filter and sort labels
- [ ] Replace product card actions
- [ ] Replace empty state
- [ ] Replace loading and error states
- [ ] Test search and filtering
- [ ] Test with products and without

**Translation Keys:** `dashboard.products.*` (20 keys)  
**Time Estimate:** 60 minutes  
**Difficulty:** ⭐⭐⭐ High

---

### 9. Dashboard - Inventory Page
- [ ] File: `/app/dashboard/curator/inventory/page.tsx`
- [ ] File: `/components/curator/inventory/InventoryList.tsx`
- [ ] File: `/components/curator/inventory/CSVImportExport.tsx`
- [ ] File: `/components/curator/inventory/VariantManager.tsx`
- [ ] Add 12 translation keys
- [ ] Note: Some child components already use `react-i18next`
- [ ] Replace page header
- [ ] Replace tab labels
- [ ] Replace help section
- [ ] Ensure consistency with child components
- [ ] Test all three tabs

**Translation Keys:** `dashboard.inventory.*` (12 keys)  
**Time Estimate:** 45 minutes  
**Difficulty:** ⭐⭐⭐ Medium-High

---

### 10. Dashboard - Store Settings
- [ ] File: `/app/dashboard/curator/store/page.tsx`
- [ ] Add 50+ translation keys
- [ ] Already 'use client', use `useT()` hook
- [ ] Replace all section titles
- [ ] Replace form labels and placeholders
- [ ] Replace validation messages
- [ ] Replace toast messages
- [ ] Replace action button labels
- [ ] Replace help text
- [ ] Test form submission
- [ ] Test image uploads
- [ ] Test validation errors
- [ ] Test success/error toasts

**Translation Keys:** `dashboard.store.*` (50+ keys)  
**Time Estimate:** 120 minutes  
**Difficulty:** ⭐⭐⭐⭐ Very High

---

### 11. Dashboard - Analytics Page
- [ ] File: `/app/dashboard/curator/analytics/page.tsx`
- [ ] Add 30 translation keys
- [ ] Already 'use client', use `useT()` hook
- [ ] Replace page header
- [ ] Replace time period labels
- [ ] Replace metric labels
- [ ] Replace section titles
- [ ] Replace chart labels
- [ ] Replace device and location labels
- [ ] Test all time period switches
- [ ] Test metric toggles

**Translation Keys:** `dashboard.analytics.*` (30 keys)  
**Time Estimate:** 90 minutes  
**Difficulty:** ⭐⭐⭐ High

---

## 🔧 Pre-Implementation Steps

Before starting, complete these setup tasks:

- [x] Review existing i18n implementation
- [x] Understand `useT()` hook for client components
- [x] Understand `t(locale, key)` for server components
- [x] Understand `getLocale()` function
- [ ] Backup `/locales/en/common.json`
- [ ] Backup `/locales/es/common.json`
- [ ] Set up local development environment
- [ ] Test language switcher works correctly
- [ ] Review translation key naming conventions

---

## ✅ Post-Implementation Steps

After completing each component:

- [ ] **Test in English:** Switch to EN and verify all strings display
- [ ] **Test in Spanish:** Switch to ES and verify all strings display
- [ ] **Test Parameters:** If using `{param}`, verify interpolation works
- [ ] **Check Console:** No "missing translation" warnings
- [ ] **Visual QA:** Layouts look good in both languages (no text overflow)
- [ ] **Mobile Test:** Check responsiveness with both languages
- [ ] **Edge Cases:** Test empty states, loading states, error states

---

## 🎯 Progress Tracker

### Overall Progress
- [ ] Phase 1: Critical Components (0/5)
- [ ] Phase 2: User Features (0/2)
- [ ] Phase 3: Dashboard (0/4)

### Total Components: 0/11 ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜

---

## 📊 Translation Keys Status

| Category | Keys to Add | Status |
|----------|-------------|--------|
| Footer | 15 | ⬜ Not started |
| Home | 7 | ⬜ Not started |
| Orders | 18 | ⬜ Not started |
| Order Confirmation | 25 | ⬜ Not started |
| Account | 25 | ⬜ Not started |
| Favorites | 8 | ⬜ Not started |
| Dashboard Products | 20 | ⬜ Not started |
| Dashboard Inventory | 12 | ⬜ Not started |
| Dashboard Store | 50+ | ⬜ Not started |
| Dashboard Analytics | 30 | ⬜ Not started |
| **TOTAL** | **~210** | **0/210** |

---

## 🚀 Quick Implementation Template

### For Client Components:

```typescript
'use client'
import { useT } from '@/hooks/useT'

export default function MyComponent() {
  const t = useT()
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description', { param: 'value' })}</p>
    </div>
  )
}
```

### For Server Components:

```typescript
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export default async function MyPage() {
  const locale = await getLocale()
  
  return (
    <div>
      <h1>{t(locale, 'mySection.title')}</h1>
      <p>{t(locale, 'mySection.description', { param: 'value' })}</p>
    </div>
  )
}
```

### Adding Translation Keys:

```json
// locales/en/common.json
{
  "mySection.title": "My Title",
  "mySection.description": "Description with {param}"
}

// locales/es/common.json
{
  "mySection.title": "Mi Título",
  "mySection.description": "Descripción con {param}"
}
```

---

## 📚 Reference Documents

- **Full Implementation Guide:** `docs/i18n-implementation-guide.md`
- **Architecture Diagram:** `docs/i18n-architecture.md`
- **Translation Keys JSON:** `docs/translation-keys-to-add.json`
- **Summary Report:** `docs/i18n-summary.md`

---

## ⚠️ Common Pitfalls to Avoid

1. ❌ **Don't mix server/client translation methods**
   - Server: `t(locale, 'key')`
   - Client: `const t = useT(); t('key')`

2. ❌ **Don't forget to add keys to BOTH language files**
   - Always add to `/locales/en/common.json` AND `/locales/es/common.json`

3. ❌ **Don't use hardcoded strings in new code**
   - Always use translation keys, even for single words

4. ❌ **Don't forget parameter interpolation**
   - Translation: `"greeting": "Hello {name}"`
   - Usage: `t('greeting', { name: 'John' })`

5. ❌ **Don't skip testing in both languages**
   - Always test EN and ES after implementing

---

## 🎉 Completion Criteria

You've successfully completed i18n implementation when:

- ✅ All 11 components are translated
- ✅ All ~210 translation keys are added to both language files
- ✅ Language switcher works on all pages
- ✅ No "missing translation" warnings in console
- ✅ Both languages display correctly (no layout issues)
- ✅ Parameter interpolation works where needed
- ✅ All edge cases tested (empty states, errors, etc.)

---

**Version:** 1.0  
**Last Updated:** 2024-02-10  
**Estimated Total Time:** 8-12 hours  
**Status:** Ready for Implementation ✅
