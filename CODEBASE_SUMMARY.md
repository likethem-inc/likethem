# LikeThem Codebase - Quick Reference

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom Design System |
| **Animations** | Framer Motion |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js |
| **Storage** | Supabase Storage |
| **Icons** | Lucide React |
| **i18n** | Custom (ES/EN) |

## 📂 Key Directories

```
likethem/
├── app/                    # ⚡ Next.js App Router (pages & API routes)
├── components/             # 🧩 Reusable React components
├── lib/                    # 🛠️ Utilities, helpers, business logic
├── locales/               # 🌐 Translation files (en/es)
├── prisma/                # 🗄️ Database schema & migrations
├── public/                # 📁 Static assets (images, fonts)
├── types/                 # 📘 TypeScript type definitions
└── hooks/                 # 🪝 Custom React hooks
```

## 🎯 Existing Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Home/Landing page |
| `/explore` | `app/explore/page.tsx` | Browse curators |
| `/access` | `app/access/page.tsx` | Request buying access |
| `/apply` | `app/apply/page.tsx` | Apply to be a curator |
| `/cart` | `app/cart/page.tsx` | Shopping cart |
| `/checkout` | `app/checkout/page.tsx` | Checkout flow |
| `/favorites` | `app/favorites/page.tsx` | User favorites |
| `/orders` | `app/orders/page.tsx` | Order history |
| `/account` | `app/account/page.tsx` | User account settings |
| `/search` | `app/search/page.tsx` | Search functionality |
| `/unauthorized` | `app/unauthorized/page.tsx` | Access denied page |

**Note**: `/about` does not exist yet! ✨

## 🎨 Design System

### Colors
```css
carbon:     #1A1A1A   /* Primary text & buttons */
cream:      #F8F6F0   /* Subtle backgrounds */
stone:      #F5F5F4   /* Card backgrounds */
warm-gray:  #78716C   /* Secondary text */
white:      #FFFFFF   /* Main background */
```

### Typography
```css
font-serif:    Playfair Display  /* Headings */
font-sans:     Inter             /* Body text */
font-display:  Canela            /* Special display */
```

### Common CSS Classes
```css
/* Buttons */
btn-primary              → Black bg, white text, hover effect
btn-secondary            → Border with hover fill
btn-editorial            → Uppercase, spaced letters

/* Layout */
container-custom         → Centered container with padding
min-h-screen            → Full viewport height
page-content            → Standard page padding (py-24)

/* Typography */
text-heading            → Large serif headlines
text-subheading         → Smaller, warm-gray subheads
font-light              → Thin font weight (common)
```

## 🧩 Key Components

| Component | Location | Usage |
|-----------|----------|-------|
| **Header** | `components/Header.tsx` | Global navigation (in root layout) |
| **Footer** | `components/Footer.tsx` | Site footer (imported per page) |
| **Hero** | `components/Hero.tsx` | Full-screen hero sections |
| **CTAButton** | `components/ui/CTAButton.tsx` | Styled buttons/links |
| **ImageWithFallback** | `components/ImageWithFallback.tsx` | Images with error handling |

## 🌐 Internationalization Pattern

```typescript
// 1. Server Component (default)
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export default async function Page() {
  const locale = await getLocale()
  const title = t(locale, 'page.title')
  
  return <h1>{title}</h1>
}

// 2. Add to locales/en/common.json
{
  "page.title": "My Page Title"
}

// 3. Add to locales/es/common.json
{
  "page.title": "Título de Mi Página"
}
```

## 🎬 Animation Pattern

```typescript
'use client' // Required for Framer Motion

import { motion } from 'framer-motion'

export default function Component() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      Content fades in from below
    </motion.div>
  )
}
```

## 📄 Standard Page Template

```typescript
// app/mypage/page.tsx
import Footer from '@/components/Footer'
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export async function generateMetadata() {
  const locale = await getLocale()
  return {
    title: t(locale, 'mypage.title'),
    description: t(locale, 'mypage.description'),
  }
}

export default async function MyPage() {
  const locale = await getLocale()
  
  return (
    <>
      <main className="min-h-screen bg-white">
        <section className="py-24">
          <div className="container-custom max-w-4xl">
            <h1 className="text-heading mb-6">
              {t(locale, 'mypage.heading')}
            </h1>
            <p className="text-subheading">
              {t(locale, 'mypage.subtitle')}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
```

## 🎯 Design Inspirations

The LikeThem aesthetic is inspired by:
- **Net-a-Porter**: Clean, editorial layouts
- **SSENSE**: Minimalist product presentation
- **By Far**: Modern serif typography
- **The Frankie Shop**: Curated, exclusive feel

### Key Visual Elements:
✅ Large, high-quality photography
✅ Serif fonts for headlines
✅ Lots of white space
✅ Minimal color usage
✅ Subtle hover animations
✅ Editorial-style product cards
✅ Premium, exclusive messaging

## 🔍 Finding Things

```bash
# Search for component usage
grep -r "ComponentName" app/ components/

# Find all pages
find app -name "page.tsx"

# Check translation keys
cat locales/en/common.json | grep "keyword"

# View component structure
tree components/ -L 2
```

## 🚀 Development Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📝 Common Patterns

### Image Usage
```tsx
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  alt="Description"
  width={1200}
  height={800}
  className="object-cover"
  priority // Use for above-the-fold images
/>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Link Usage
```tsx
import Link from 'next/link'

<Link 
  href="/about" 
  className="hover:text-white transition-colors"
>
  About Us
</Link>
```

### Client vs Server Components
- **Server (default)**: No interactivity, can use async/await, better performance
- **Client (`'use client'`)**: For hooks, events, Framer Motion, useState, useEffect

## 🎨 Brand Voice

**Key messaging themes:**
- **Exclusive**: "Not for everyone"
- **Curated**: "Personally selected"
- **Editorial**: "Fashion that matters"
- **Premium**: "Dress like the ones you admire"
- **Selective**: Limited access, quality over quantity

## 📚 Important Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with Header |
| `app/globals.css` | Global styles & Tailwind config |
| `tailwind.config.js` | Tailwind customization |
| `components/Footer.tsx` | Site footer |
| `lib/i18n/t.ts` | Translation function |
| `prisma/schema.prisma` | Database schema |

---

**You now have a complete understanding of the LikeThem codebase!** 🎉
