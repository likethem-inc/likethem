# About Page

## Overview
The About page communicates LikeThem's brand story, mission, and value proposition. It's designed to convert visitors into users by clearly articulating what makes LikeThem unique in the fashion curation space.

## Location
- **Route**: `/about`
- **File**: `/app/about/page.tsx`
- **Type**: Client component (uses Framer Motion animations)

## Design System

### Typography
- **Headings**: `font-serif` (Playfair Display) for editorial elegance
- **Body**: `font-sans` (Inter) for readability
- **Hierarchy**: 
  - Hero: `text-5xl md:text-6xl lg:text-7xl`
  - Section titles: `text-4xl md:text-5xl`
  - Subsections: `text-2xl` to `text-3xl`

### Color Palette
- **White sections**: `bg-white` - Clean, premium feel
- **Stone sections**: `bg-stone` (#F5F5F4) - Warm, neutral background
- **Carbon sections**: `bg-carbon` (#1A1A1A) - Bold contrast for mission statement
- **Text**: 
  - Primary: `text-carbon` / `text-zinc-900`
  - Secondary: `text-zinc-600` / `text-zinc-700`

### Layout
- **Max width**: `max-w-4xl` to `max-w-6xl` depending on section
- **Padding**: `py-24` for consistent vertical rhythm
- **Grid**: Responsive grids (`md:grid-cols-2`, `md:grid-cols-3`)

## Page Sections

### 1. Hero Section
- Full-screen hero with background image
- Large serif heading with tagline
- Subtle dark overlay (40% opacity) for text legibility
- Fade-in animation on load

### 2. Story Section
- White background for readability
- Three-paragraph narrative structure
- Centered, medium-width layout for optimal reading
- Explains the "why" behind LikeThem

### 3. How It Works Section
- Stone background for visual separation
- Three-column grid (responsive)
- Numbered steps with circular badges
- Staggered fade-in animations (0.1s delays)

### 4. Values Section
- White background
- Four value cards in 2x2 grid
- Each card has stone background for subtle elevation
- Communicates: Exclusivity, Curation, Quality, Community

### 5. Mission Statement
- Carbon background with white text for emphasis
- Large, statement-style typography
- Centered, impactful layout

### 6. CTA Section
- Stone background
- Two primary action buttons:
  - "Request Access" (primary variant)
  - "Apply as Curator" (secondary variant)
- Clear, compelling copy

### 7. Team Section
- White background
- Brief, humble team description
- Establishes credibility without being corporate

### 8. Footer
- Reusable `<Footer />` component
- Consistent across all pages

## Animations

All sections use Framer Motion with a consistent `fadeInUp` animation:

```javascript
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
}
```

Staggered animations use delay increments (0.1s, 0.2s, 0.3s) for visual hierarchy.

## Translations

All content is internationalized with keys in `locales/[locale]/common.json`:

### English Keys (`locales/en/common.json`)
- `about.hero.title`
- `about.hero.subtitle`
- `about.story.title`
- `about.story.paragraph1-3`
- `about.howItWorks.*`
- `about.values.*`
- `about.mission.*`
- `about.cta.*`
- `about.team.*`

### Spanish Keys (`locales/es/common.json`)
Same key structure with Spanish translations.

## Assets

### Images
- **Hero image**: `/public/images/about/hero.jpg`
- Currently using home banner as placeholder
- **Recommended specs**:
  - Resolution: 1920x1080px minimum
  - Format: JPG (optimized)
  - Style: Editorial fashion photography
  - Subject: Lifestyle/fashion scene that communicates luxury and curation

## Navigation

The About page is accessible from:
1. **Footer**: "About us" link in Company section
2. **Direct URL**: `yoursite.com/about`

## Brand Voice

The copy follows LikeThem's brand guidelines:
- **Confident**: "Not for everyone, and that's by design"
- **Exclusive**: Emphasizes selective access and quality
- **Authentic**: Focus on real curation, not algorithms
- **Aspirational**: "Dress like the ones you admire"
- **Editorial**: Sophisticated, magazine-style language

## Technical Details

### Component Type
- Client Component (`'use client'`)
- Required for Framer Motion animations

### Dependencies
- `framer-motion`: Animations
- `next/image`: Optimized image loading
- `next/link`: Internal navigation
- Custom hooks: `useTranslation`

### Performance Optimizations
- Hero image has `priority` flag for LCP optimization
- Animations use `viewport: { once: true }` to fire only once
- Lazy loading for below-the-fold content via `whileInView`

## Future Enhancements

### Phase 2 Ideas
1. **Team Photos**: Add curator/team member profiles
2. **Stats Section**: User count, curator count, products curated
3. **Timeline**: Visual history of LikeThem milestones
4. **Video**: Embedded brand video or curator testimonials
5. **Press Section**: "As seen in" logos and quotes
6. **Interactive Elements**: Hover effects on value cards, parallax scrolling

### Content Iterations
- A/B test different hero taglines
- Add curator success stories
- Expand mission section with specific goals
- Include behind-the-scenes content

## Maintenance

### Content Updates
To update content, edit the translation files:
1. English: `/locales/en/common.json`
2. Spanish: `/locales/es/common.json`

Look for keys prefixed with `about.*`

### Image Updates
Replace `/public/images/about/hero.jpg` with new editorial image. Ensure:
- High resolution (min 1920px wide)
- Optimized file size (< 500KB if possible)
- Proper rights/licensing for commercial use

### Design System Updates
If global styles change:
- Check `tailwind.config.js` for color/font updates
- Update this page's classes accordingly
- Maintain consistency with other pages (explore, apply, etc.)

## Testing Checklist

- [ ] Page loads without errors
- [ ] All translations display correctly (EN/ES)
- [ ] Hero image loads and displays properly
- [ ] Animations trigger smoothly on scroll
- [ ] CTAs link to correct pages (/access, /apply)
- [ ] Footer renders correctly
- [ ] Responsive on mobile, tablet, desktop
- [ ] Typography hierarchy is clear
- [ ] Color contrast meets accessibility standards
- [ ] Page can be accessed from footer link

## Accessibility

- Semantic HTML structure (section, h1, h2, h3)
- Alt text on images
- Sufficient color contrast ratios
- Keyboard navigation support (native links/buttons)
- Screen reader friendly (proper heading hierarchy)

---

**Created**: February 2024  
**Last Updated**: February 2024  
**Maintainer**: LikeThem Development Team
