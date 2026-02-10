# LikeThem i18n Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LIKETHEM i18n SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        TRANSLATION FILES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   /locales/                                                               │
│   ├── en/                                                                 │
│   │   └── common.json  ←─────────── 246 keys (English)                  │
│   └── es/                                                                 │
│       └── common.json  ←─────────── 246 keys (Spanish - Default)        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ imported by
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          CORE UTILITIES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   /lib/i18n/                                                              │
│   │                                                                       │
│   ├── getLocale.ts ─────────► Cookie: likethem_locale                   │
│   │   │                       Default: 'es'                              │
│   │   ├── getLocale()         (server-side async)                       │
│   │   ├── getLocaleFromHeaders() (API routes)                           │
│   │   └── getLocaleFromCookie() (client-side)                           │
│   │                                                                       │
│   └── t.ts                                                                │
│       ├── t(locale, key, params?) ─► Server translation function        │
│       └── getTranslations(locale)  ─► Get all keys for locale           │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                    │                              │
        ┌───────────┘                              └───────────┐
        │ Server Components                     Client Components │
        ▼                                                          ▼
┌──────────────────────────┐                    ┌─────────────────────────┐
│   SERVER SIDE            │                    │    CLIENT SIDE          │
├──────────────────────────┤                    ├─────────────────────────┤
│                          │                    │                         │
│  App Router Pages:       │                    │  /hooks/useT.ts         │
│  └── page.tsx            │                    │  └── useT()             │
│      │                   │                    │      └── returns t()    │
│      │                   │                    │                         │
│      import { getLocale }│                    │  /components/i18n/      │
│      import { t }        │                    │  ├── I18nProvider.tsx   │
│      │                   │                    │  │   └── Context API    │
│      const locale =      │                    │  │                      │
│        await getLocale() │                    │  └── LanguageSwitcher   │
│      │                   │                    │      └── Toggle UI      │
│      t(locale, 'key')    │                    │                         │
│                          │                    │  'use client'           │
│  Examples:               │                    │  const t = useT()       │
│  • /app/explore/page.tsx │                    │  t('key')               │
│  • /app/apply/page.tsx   │                    │                         │
│                          │                    │  Examples:              │
│                          │                    │  • /components/Header   │
│                          │                    │  • Client components    │
│                          │                    │                         │
└──────────────────────────┘                    └─────────────────────────┘
                                                           │
                                                           │ wraps
                                                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      ROOT LAYOUT PROVIDER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  /app/layout.tsx                                                          │
│  └── async function RootLayout()                                         │
│      ├── const locale = await getLocale()                                │
│      └── <ClientProviders locale={locale}>                               │
│                                                                           │
│  /components/ClientProviders.tsx                                          │
│  └── <I18nProvider initialLocale={locale}>                              │
│      └── {children}                                                       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         LOCALE PERSISTENCE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Cookie: likethem_locale                                                 │
│  ├── Max Age: 1 year                                                     │
│  ├── Path: /                                                              │
│  ├── SameSite: Lax                                                       │
│  └── Values: 'es' | 'en'                                                 │
│                                                                           │
│  API Endpoint: /api/i18n/locale                                          │
│  └── POST { locale: 'en' | 'es' }                                       │
│      └── Updates server-side cookie                                      │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          USER FLOW                                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. User visits site                                                      │
│     └─► getLocale() reads cookie → defaults to 'es'                     │
│                                                                           │
│  2. User clicks LanguageSwitcher                                         │
│     ├─► Updates React context                                            │
│     ├─► Sets browser cookie                                              │
│     ├─► Calls POST /api/i18n/locale                                     │
│     └─► router.refresh() → reloads server components                    │
│                                                                           │
│  3. All components re-render with new locale                             │
│     ├─► Server components use new locale from cookie                    │
│     └─► Client components use new locale from context                   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     TRANSLATION KEY STRUCTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Flat structure with dot notation:                                       │
│                                                                           │
│  {                                                                        │
│    "nav.dress": "Dress Like Them",                                       │
│    "nav.sell": "Sell Like Them",                                         │
│    "explore.title": "Discover Curators",                                 │
│    "product.addToCart": "Add to cart",                                   │
│    "curator.follow": "Follow"                                            │
│  }                                                                        │
│                                                                           │
│  Namespaces:                                                              │
│  ├── nav.*           Navigation                                          │
│  ├── auth.*          Authentication                                      │
│  ├── user.*          User account                                        │
│  ├── explore.*       Explore page                                        │
│  ├── curator.*       Curator profiles                                    │
│  ├── product.*       Product pages                                       │
│  ├── dashboard.*     Dashboard pages                                     │
│  ├── orders.*        Orders                                              │
│  ├── account.*       Account settings                                    │
│  ├── footer.*        Footer                                              │
│  ├── home.*          Home page                                           │
│  └── common.*        Reusable UI elements                                │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                    PARAMETER INTERPOLATION                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Translation:                                                             │
│  {                                                                        │
│    "greeting": "Hello {name}!",                                          │
│    "products.count": "You have {count} products"                         │
│  }                                                                        │
│                                                                           │
│  Usage:                                                                   │
│  t('greeting', { name: 'John' })                                         │
│  // Result: "Hello John!"                                                │
│                                                                           │
│  t('products.count', { count: 5 })                                       │
│  // Result: "You have 5 products"                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      CURRENT COVERAGE                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ✅ TRANSLATED (30%)                                                     │
│  ├── Header                                                               │
│  ├── Auth pages (signin/signup)                                          │
│  ├── Explore page                                                         │
│  ├── Product pages                                                        │
│  ├── Curator profiles                                                     │
│  ├── Access modals                                                        │
│  ├── Apply forms                                                          │
│  └── About page                                                           │
│                                                                           │
│  ❌ NEEDS TRANSLATION (70%)                                              │
│  ├── Footer                                                               │
│  ├── Home page                                                            │
│  ├── Account page                                                         │
│  ├── Orders page                                                          │
│  ├── Order confirmation                                                   │
│  ├── Favorites page                                                       │
│  └── Dashboard pages                                                      │
│      ├── Products                                                         │
│      ├── Inventory                                                        │
│      ├── Store settings                                                   │
│      └── Analytics                                                        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Features

### ✅ Server-Side Rendering Support
- Locale detected before page render
- SEO-friendly translations
- No layout shift on language change

### ✅ Cookie-Based Persistence
- User preference saved for 1 year
- Works across sessions
- Synced between client and server

### ✅ Type-Safe
- TypeScript support
- IntelliSense for translation keys
- Compile-time key validation

### ✅ Developer-Friendly
- Simple API: `t('key')` or `t(locale, 'key')`
- Parameter interpolation: `{param}`
- Missing key warnings in development

### ✅ Performance Optimized
- Translations bundled at build time
- No runtime fetching
- Minimal bundle size impact

---

## Quick Start Examples

### Server Component
```typescript
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export default async function MyPage() {
  const locale = await getLocale()
  
  return (
    <div>
      <h1>{t(locale, 'page.title')}</h1>
      <p>{t(locale, 'page.description', { name: 'User' })}</p>
    </div>
  )
}
```

### Client Component
```typescript
'use client'
import { useT } from '@/hooks/useT'

export default function MyComponent() {
  const t = useT()
  
  return (
    <button>{t('common.save')}</button>
  )
}
```

### Add Translation Keys
```json
// locales/en/common.json
{
  "page.title": "Welcome",
  "page.description": "Hello {name}!",
  "common.save": "Save"
}

// locales/es/common.json
{
  "page.title": "Bienvenido",
  "page.description": "¡Hola {name}!",
  "common.save": "Guardar"
}
```

---

**Architecture Version:** 1.0  
**Last Updated:** 2024-02-10  
**Status:** Production Ready ✅
