# About Page Architecture - Visual Guide

## 📐 Recommended Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│              (Automatically included from layout)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│                     HERO SECTION                             │
│                  (Full viewport height)                      │
│                                                              │
│  [Large Editorial Image with Overlay]                       │
│                                                              │
│           "Curating Fashion, One Influencer at a Time"       │
│              Subtitle about the mission                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     OUR STORY                                │
│                   (py-24 spacing)                            │
│                                                              │
│  - Origin of LikeThem                                        │
│  - Why we're different                                       │
│  - The problem we solve                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     THE VISION                               │
│              (Two-column on desktop)                         │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Editorial Photo │  │   Vision Text    │                │
│  │                  │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     OUR VALUES                               │
│                  (3-column grid)                             │
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │  Icon   │  │  Icon   │  │  Icon   │                     │
│  │ Quality │  │ Curation│  │Community│                     │
│  └─────────┘  └─────────┘  └─────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     HOW IT WORKS                             │
│                   (Process steps)                            │
│                                                              │
│  1. Curators Apply  →  2. Curation  →  3. Exclusive Access  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     STATS SECTION                            │
│                 (Optional: Numbers)                          │
│                                                              │
│   1000+          500+          10K+                          │
│   Curators       Brands        Members                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     CTA SECTION                              │
│                                                              │
│         "Ready to discover curated fashion?"                 │
│                                                              │
│    [Explore Stores]    [Apply to Curate]                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                        FOOTER                                │
│            (Imported from components/Footer.tsx)             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Section Breakdown

### 1. Hero Section
```tsx
<section className="relative h-screen flex items-center justify-center">
  {/* Background image with overlay */}
  {/* Centered title and subtitle */}
</section>
```

**Key Features:**
- Full viewport height (`h-screen`)
- Large editorial image
- Dark overlay for text readability
- Serif headline with light font weight
- Animated entrance (Framer Motion)

---

### 2. Story Section
```tsx
<section className="py-24 bg-white">
  <div className="container-custom max-w-4xl">
    {/* Story content */}
  </div>
</section>
```

**Key Features:**
- Standard vertical spacing (`py-24`)
- Centered, readable width (`max-w-4xl`)
- Mix of headings and paragraphs
- Emphasis on exclusivity and curation

---

### 3. Vision Section (Two-Column)
```tsx
<section className="py-24 bg-stone">
  <div className="container-custom">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>{/* Image */}</div>
      <div>{/* Text */}</div>
    </div>
  </div>
</section>
```

**Key Features:**
- Alternate background color (`bg-stone`)
- Responsive grid (stacks on mobile)
- Image + text combination
- Visual variety in layout

---

### 4. Values Section (Three Cards)
```tsx
<section className="py-24 bg-white">
  <div className="container-custom">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Value cards */}
    </div>
  </div>
</section>
```

**Key Features:**
- Three-column grid (responsive)
- Icon + title + description per card
- Lucide React icons
- Simple, clean cards

---

### 5. CTA Section
```tsx
<section className="py-32 bg-carbon text-white">
  <div className="container-custom text-center">
    {/* Call to action buttons */}
  </div>
</section>
```

**Key Features:**
- Dark background (`bg-carbon`)
- White text for contrast
- Two primary CTAs
- Centered content

---

## 📦 Component Breakdown

### File: `app/about/page.tsx`

```typescript
import Footer from '@/components/Footer'
import AboutHero from '@/components/about/AboutHero'
import OurStory from '@/components/about/OurStory'
import OurVision from '@/components/about/OurVision'
import OurValues from '@/components/about/OurValues'
import AboutCTA from '@/components/about/AboutCTA'
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
      <AboutHero locale={locale} />
      <OurStory locale={locale} />
      <OurVision locale={locale} />
      <OurValues locale={locale} />
      <AboutCTA locale={locale} />
      <Footer />
    </>
  )
}
```

### Option: Single File Approach

Alternatively, you can keep all sections in one file:

```typescript
// app/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { Sparkles, Heart, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Content */}
      </section>

      {/* Story Section */}
      <section className="py-24 bg-white">
        {/* Content */}
      </section>

      {/* Vision Section */}
      <section className="py-24 bg-stone">
        {/* Content */}
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        {/* Content */}
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-carbon text-white">
        {/* Content */}
      </section>

      <Footer />
    </>
  )
}
```

---

## 🎯 Content Suggestions

### Hero Section
- **Headline**: "Curating Fashion, One Influencer at a Time"
- **Subheadline**: "Connecting style-conscious shoppers with the curated closets of influencers they admire"

### Our Story
- **Title**: "Where Fashion Meets Curation"
- **Content**: 
  - The gap in the market (fast fashion vs. real style)
  - How LikeThem was born
  - The vision to make influencer style accessible

### Our Vision
- **Title**: "Redefining Fashion Discovery"
- **Content**:
  - Moving beyond algorithms
  - Personal curation by real style experts
  - Building a community, not just a marketplace

### Our Values
1. **Quality Over Quantity**
   - Icon: Sparkles
   - Every piece is hand-selected
   - No mass production, no fast fashion

2. **Curator-First**
   - Icon: Heart
   - Supporting influencers and creators
   - Fair compensation for curation

3. **Exclusive Community**
   - Icon: Users
   - Limited access maintains quality
   - Building relationships, not just transactions

### CTA Section
- **Headline**: "Ready to Discover Curated Fashion?"
- **Buttons**: 
  - "Explore Curators" → `/explore`
  - "Apply to Curate" → `/apply`

---

## 🎨 Visual Guidelines

### Image Recommendations

**Hero Image:**
- Size: 1920x1080px minimum
- Style: Editorial fashion photography
- Subject: Fashion-forward scene, aspirational
- Location: `/public/images/about/hero.jpg`

**Vision/Story Images:**
- Size: 800x600px minimum
- Style: Behind-the-scenes, authentic
- Subject: Curation process, community
- Location: `/public/images/about/`

### Color Usage

```css
/* Alternate section backgrounds */
Section 1: bg-white
Section 2: bg-stone
Section 3: bg-white
Section 4: bg-stone
Section 5: bg-carbon (dark CTA)
```

### Typography Hierarchy

```css
Main Headline:    font-serif text-5xl md:text-7xl font-light
Section Titles:   font-serif text-4xl md:text-5xl font-light
Subsections:      font-serif text-2xl md:text-3xl font-light
Body Text:        font-sans text-lg text-warm-gray
```

---

## ✅ Implementation Checklist

### Phase 1: Structure
- [ ] Create `/app/about/page.tsx`
- [ ] Add basic hero section
- [ ] Add story section
- [ ] Add Footer import

### Phase 2: Content
- [ ] Add translations to `locales/en/common.json`
- [ ] Add translations to `locales/es/common.json`
- [ ] Add metadata with `generateMetadata()`
- [ ] Write compelling copy

### Phase 3: Visuals
- [ ] Add hero image to `/public/images/about/`
- [ ] Add supporting images
- [ ] Optimize images (Next.js Image component)
- [ ] Add icons from Lucide React

### Phase 4: Interactivity
- [ ] Add Framer Motion animations
- [ ] Add hover effects on cards/buttons
- [ ] Test responsive design
- [ ] Add smooth scrolling (optional)

### Phase 5: Polish
- [ ] Test in both languages (EN/ES)
- [ ] Verify all links work
- [ ] Check mobile responsiveness
- [ ] Run accessibility audit
- [ ] Test page load performance

---

## 🎬 Animation Suggestions

```tsx
// Fade in hero content
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  {/* Hero content */}
</motion.div>

// Stagger value cards
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }}
>
  {values.map((value) => (
    <motion.div
      key={value.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {/* Value card */}
    </motion.div>
  ))}
</motion.div>
```

---

**You're all set to create an About page that perfectly matches the LikeThem aesthetic!** 🎨✨
