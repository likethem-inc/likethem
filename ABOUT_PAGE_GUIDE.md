# LikeThem About Page - Implementation Guide

## 📋 Project Overview

**LikeThem** is an exclusive fashion marketplace built with:
- **Framework**: Next.js 14 with App Router (TypeScript)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Internationalization**: Custom i18n system (Spanish/English)
- **Icons**: Lucide React
- **Database**: PostgreSQL with Prisma
- **Auth**: NextAuth.js

## 🎨 Design Philosophy

LikeThem follows a **high-end editorial design** inspired by:
- Net-a-Porter
- SSENSE
- By Far
- The Frankie Shop

### Key Design Principles:
1. **Minimalist & Premium**: Clean, white backgrounds with minimal color
2. **Typography-First**: Serif fonts for headings (Playfair Display, Canela)
3. **Editorial Photography**: Large, high-quality images without frames
4. **Subtle Animations**: Smooth transitions with Framer Motion
5. **Exclusivity**: Messaging emphasizes selectivity and curation

## 📁 Project Structure

```
likethem/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Header
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles & Tailwind
│   ├── access/                  # Access request page
│   ├── explore/                 # Curator discovery
│   ├── apply/                   # Curator application
│   └── [other-routes]/         # Various pages
├── components/                   # Reusable components
│   ├── Footer.tsx               # Site footer (used on all pages)
│   ├── Header.tsx               # Site header (in root layout)
│   ├── Hero.tsx                 # Large hero sections
│   ├── home/                    # Home-specific components
│   ├── ui/                      # UI primitives (buttons, etc.)
│   └── [feature-folders]/       # Feature-specific components
├── lib/                         # Utilities and logic
│   ├── i18n/                    # Internationalization
│   │   ├── getLocale.ts        # Server-side locale detection
│   │   └── t.ts                # Translation function
│   └── [other-utils]/
├── locales/                     # Translation files
│   ├── en/common.json          # English translations
│   └── es/common.json          # Spanish translations
└── public/                      # Static assets
```

## 🧩 Routing Pattern

**LikeThem uses Next.js 14 App Router:**
- Each route is a folder in `/app`
- Main page file is `page.tsx`
- Example: `/app/about/page.tsx` → `https://likethem.io/about`

## 🎭 Page Structure Pattern

### Standard Page Template:

```tsx
// app/about/page.tsx
import Footer from '@/components/Footer'
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export async function generateMetadata() {
  const locale = await getLocale()
  return {
    title: t(locale, 'about.title'),
    description: t(locale, 'about.description'),
  }
}

export default async function AboutPage() {
  const locale = await getLocale()
  
  return (
    <>
      <main className="min-h-screen bg-white">
        {/* Page content */}
      </main>
      <Footer />
    </>
  )
}
```

### Key Observations:

1. **Header is Global**: Defined in `app/layout.tsx`, always visible
2. **Footer is Per-Page**: Imported and rendered at the bottom of each page
3. **Main Content**: Wrapped in `<main>` tag with `min-h-screen` for full height
4. **Server Components**: Pages are server components by default (use `'use client'` directive only when needed)
5. **Metadata**: Use `generateMetadata()` for SEO
6. **i18n**: Always fetch locale and use `t()` function for translations

## 🎨 Styling Patterns

### Color Palette:
```css
carbon: #1A1A1A    /* Main text, buttons */
cream: #F8F6F0     /* Subtle backgrounds */
stone: #F5F5F4     /* Card backgrounds */
warm-gray: #78716C /* Secondary text */
white: #FFFFFF     /* Primary background */
```

### Typography:
```css
font-serif  → Playfair Display (headings)
font-sans   → Inter (body text)
font-display → Canela (special display text)
```

### Common Classes:
```css
/* Buttons */
.btn-primary         → Black background, white text
.btn-secondary       → White with black border
.btn-editorial       → Editorial-style CTA

/* Layout */
.container-custom    → Max-width container with padding
.min-h-screen        → Full viewport height

/* Typography */
.text-heading        → Large serif headings
.text-subheading     → Subheadings with warm-gray
```

## 🌐 Internationalization (i18n)

### Adding Translations:

1. **Add to `/locales/en/common.json`:**
```json
{
  "about.title": "About LikeThem",
  "about.description": "Learn about our mission...",
  "about.hero.title": "Curating Fashion, One Influencer at a Time"
}
```

2. **Add to `/locales/es/common.json`:**
```json
{
  "about.title": "Acerca de LikeThem",
  "about.description": "Conoce nuestra misión...",
  "about.hero.title": "Curando Moda, Un Influencer a la Vez"
}
```

3. **Use in components:**
```tsx
const locale = await getLocale()
const title = t(locale, 'about.title')
```

## 🎬 Animation Patterns

### Framer Motion Usage:
```tsx
import { motion } from 'framer-motion'

// Fade in on load
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  {/* Content */}
</motion.div>

// Stagger children animations
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ staggerChildren: 0.1 }}
>
  {/* Children will animate one after another */}
</motion.div>
```

**Note**: Framer Motion requires `'use client'` directive!

## 📦 Component Examples

### 1. Hero Section Pattern:
```tsx
<section className="relative h-screen flex items-center justify-center overflow-hidden">
  <div className="absolute inset-0">
    <Image src="/images/hero.jpg" alt="Hero" fill className="object-cover" />
    <div className="absolute inset-0 bg-black/15" />
  </div>
  
  <div className="relative z-10 text-center text-white container-custom">
    <h1 className="font-serif text-5xl md:text-7xl font-light uppercase">
      Your Title
    </h1>
    <p className="text-xl text-white/90 font-light">
      Your subtitle
    </p>
  </div>
</section>
```

### 2. Content Section Pattern:
```tsx
<section className="py-24 bg-white">
  <div className="container-custom max-w-4xl">
    <h2 className="text-heading mb-6">Section Title</h2>
    <p className="text-subheading">Section content...</p>
  </div>
</section>
```

### 3. Two-Column Layout:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

## 🔗 Footer Component

The Footer is located at `/components/Footer.tsx` and includes:
- Brand description
- Newsletter signup
- Navigation links (Explore, Company sections)
- **Already has a link to `/about`** (line 54)

```tsx
<Link href="/about" className="hover:text-white transition-colors">
  About us
</Link>
```

## 📝 Recommended About Page Structure

Based on the project patterns, an About page should include:

1. **Hero Section**
   - Large editorial image
   - Mission statement
   - Minimal overlay

2. **Story Section**
   - Origin story
   - What makes LikeThem different
   - Emphasis on exclusivity and curation

3. **Values Section**
   - Quality over quantity
   - Curator-first approach
   - Community and style

4. **Team Section (Optional)**
   - Key team members
   - Editorial-style photos

5. **CTA Section**
   - Link to explore curators
   - Link to apply as curator

6. **Footer**
   - Standard Footer component

## 🚀 Implementation Checklist

- [ ] Create `/app/about/page.tsx`
- [ ] Add translations to both `locales/en/common.json` and `locales/es/common.json`
- [ ] Add metadata with `generateMetadata()`
- [ ] Use server components where possible
- [ ] Use `'use client'` only for interactive/animated sections
- [ ] Import and render Footer at the end
- [ ] Use existing styling patterns (btn-primary, container-custom, etc.)
- [ ] Add high-quality editorial images to `/public/images/about/`
- [ ] Use Framer Motion for subtle animations
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Verify translations work in both languages

## 💡 Best Practices

1. **Keep it Editorial**: Large images, minimal text, lots of whitespace
2. **Maintain Brand Voice**: Exclusive, curated, premium
3. **Mobile-First**: Use responsive Tailwind classes (sm:, md:, lg:)
4. **Performance**: Use Next.js Image component with proper sizing
5. **Accessibility**: Include proper alt text and semantic HTML
6. **SEO**: Add proper metadata and structured content

## 🎯 Content Suggestions

The About page should communicate:
- **Mission**: Connect fashion lovers with influencer-curated style
- **Exclusivity**: Not everyone can sell, not everyone can buy
- **Quality**: Every piece is personally selected by curators
- **Community**: Building a community of style-conscious individuals
- **Vision**: The future of fashion discovery and shopping

---

**Ready to create your About page!** Use this guide as your reference for maintaining consistency with the LikeThem design system and codebase structure.
