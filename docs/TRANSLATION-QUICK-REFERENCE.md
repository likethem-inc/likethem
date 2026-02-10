# Translation Keys Quick Reference

## 📁 Files Generated
```
locales/en/new-translations.json  (250+ keys in English)
locales/es/new-translations.json  (250+ keys in Spanish)
docs/TRANSLATION-INTEGRATION-GUIDE.md  (Full integration guide)
```

## 🔑 Key Namespaces

### Footer
```typescript
footer.description
footer.newsletter.title
footer.newsletter.emailPlaceholder
footer.explore.{stores|curators|collections|trending}
footer.company.{about|requestAccess|contact|privacy|termsOfService}
footer.copyright
```

### Hero
```typescript
hero.title
hero.subtitle
hero.{discoverStores|applyToSell}
hero.imageAlt
```

### Home
```typescript
home.featuredCurators.{title|subtitle|cta}
```

### Favorites
```typescript
favorites.{title|subtitle}
```

### Account
```typescript
account.{title|subtitle}
account.sections.{personalDetails|savedItems|shippingAddress|paymentMethods|styleProfile}
account.personal.{fullName|email|phone|save|saving|edit|cancel}
account.personal.{changePassword|currentPassword|newPassword|confirmNewPassword}
account.personal.passwordError.{allFields|noMatch|minLength|generic}
account.shipping.{title|addNew|noAddresses|default|edit|delete}
account.payment.{title|addNew|noMethods|comingSoon}
account.style.{title|description|comingSoon}
```

### Orders
```typescript
orders.{title|subtitle|empty}
orders.{previous|next|page}
orders.{orderNumber|date|items|item|total}
```

### Order Confirmation
```typescript
orderConfirmation.{paymentPending|paymentConfirmed|paymentRejected|orderConfirmed}.{title|description}
orderConfirmation.orderDetails.title
orderConfirmation.orderInfo.{title|orderId|date|status|total}
orderConfirmation.shippingAddress.title
orderConfirmation.itemsOrdered.{title|quantity|size|color}
orderConfirmation.nextSteps.{title|pending|paid}
orderConfirmation.actions.{viewOrders|continueShopping}
orderConfirmation.{support|supportEmail}
```

### Dashboard - Products
```typescript
dashboard.products.{title|subtitle|addProduct}
dashboard.products.{search|filter|sortBy}
dashboard.products.status.{all|active|inactive}
dashboard.products.sortBy.{newest|oldest|priceHigh|priceLow|title}
dashboard.products.{noProducts|addFirst|loading|error}
dashboard.products.card.{views|favorites}
```

### Dashboard - Inventory
```typescript
dashboard.inventory.{title|subtitle}
dashboard.inventory.tabs.{list|variants|importExport}
dashboard.inventory.{noInventory|productName|variant|stock|price|status|actions}
dashboard.inventory.{updateStock|inStock|lowStock|outOfStock}
```

### Dashboard - Store
```typescript
dashboard.store.{title|subtitle|preview}
dashboard.store.profileImages.{title|avatar|banner|uploadAvatar|uploadBanner|recommended}
dashboard.store.basicInfo.{title|storeName|bio|city|style|bioHint}
dashboard.store.storeSettings.{title|visibility|public|private|editorsPick}
dashboard.store.socialLinks.{title|instagram|twitter|youtube|website}
dashboard.store.styleTags.{title|description}
dashboard.store.badges.{title|verified|exclusive|trending}
dashboard.store.{save|saving|saveSuccess|saveError|unsavedChanges|discardChanges}
```

### Dashboard - Analytics
```typescript
dashboard.analytics.{title|subtitle}
dashboard.analytics.timeRange.{7d|30d|90d}
dashboard.analytics.metrics.{storeVisits|itemsFavorited|productsSold|totalRevenue}
dashboard.analytics.topProducts.{title|views|favorites|sales|revenue}
dashboard.analytics.demographics.{title|cities|devices|desktop|mobile|tablet}
dashboard.analytics.traffic.title
dashboard.analytics.{noData|noDataDescription}
```

### Dashboard - Orders
```typescript
dashboard.orders.{title|subtitle}
dashboard.orders.filter.{all|pendingPayment|paid|processing|shipped|delivered|rejected}
dashboard.orders.{noOrders|noOrdersDescription}
dashboard.orders.card.{orderId|customer|email|date|items|total|paymentMethod|transactionCode|viewProof}
dashboard.orders.card.{shippingInfo|courier|trackingNumber|estimatedDelivery}
dashboard.orders.actions.{approvePayment|rejectPayment|addShipping|updateShipping|markDelivered}
dashboard.orders.shippingForm.{title|courier|trackingNumber|estimatedDelivery|save|cancel}
dashboard.orders.status.{pendingPayment|paid|processing|shipped|delivered|rejected}
dashboard.orders.{refresh|error|updateSuccess|updateError}
```

## 🚀 Quick Implementation Example

```tsx
'use client'
import { useTranslation } from 'react-i18next'

export default function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('orders.title')}</h1>
      <p>{t('orders.subtitle')}</p>
      
      {/* With interpolation */}
      <p>{t('orders.page', { page: 1, total: 10 })}</p>
      
      {/* With count */}
      <p>{t('orders.items', { count: 5 })}</p>
    </div>
  )
}
```

## 📊 Statistics
- **Total Keys:** ~250
- **Namespaces:** 12
- **Languages:** 2 (EN, ES)
- **Components:** 12

## ✅ Next Steps
1. Merge JSON files into `locales/{en,es}/common.json`
2. Update components to use `t()` function
3. Test both languages
4. Deploy

---
**Quick Ref Version:** 1.0
