# Contact Page Documentation

## Overview
The Contact page provides a clean, elegant interface for users to get in touch with LikeThem through various channels.

## Location
- **Route**: `/contact`
- **File**: `/app/contact/page.tsx`
- **URL**: `http://localhost:3000/contact`

## Features

### 1. Contact Methods
The page displays three primary contact methods in an elegant grid layout:

#### Phone
- **Number**: +51 957 566 408
- **Link**: Direct call link (`tel:+51957566408`)
- **Icon**: Phone icon from lucide-react

#### Instagram
- **Handle**: @likethem
- **Link**: https://www.instagram.com/likethem
- **Icon**: Instagram icon from lucide-react
- **Target**: Opens in new tab

#### TikTok
- **Handle**: @likethem
- **Link**: https://www.tiktok.com/@likethem
- **Icon**: Music2 icon (TikTok) from lucide-react
- **Target**: Opens in new tab

### 2. Sections

#### Hero Section
- Large, elegant title with "Get in Touch"
- Descriptive subtitle
- Three-column grid of contact methods (responsive: 1 column on mobile)

#### Business Inquiries Section
- Dark background (carbon color)
- Information about partnership opportunities
- Two CTAs: "Apply to Curate" and "Explore Stores"

#### Support Hours Section
- Clean white background
- Operating hours information
- Response time expectations

## Design Features

### Animations
- Framer Motion animations throughout
- Fade-in and slide-up effects on page load
- Staggered children animations for smooth transitions
- Scroll-triggered animations for sections

### Hover Effects
- Contact method cards have subtle border color transitions
- Background color changes on hover
- Icon container background transitions
- Shadow effects on hover

### Responsive Design
- Mobile-first approach
- Grid adapts from 1 column (mobile) to 3 columns (desktop)
- Typography scales appropriately
- Button layouts stack on mobile devices

### Typography
- Follows existing site patterns:
  - `font-serif` for headlines (Playfair Display)
  - `font-sans` for body text (Inter)
  - Light font weights for elegant appearance
  - Proper hierarchy with varying text sizes

### Colors
- Uses existing color palette:
  - `carbon` (#1A1A1A) for dark sections
  - `stone` for subtle backgrounds
  - `warm-gray` for secondary text
  - White for primary backgrounds

## Integration

### Layout
- Uses the global layout from `/app/layout.tsx`
- Header component automatically included
- Footer component explicitly included at page bottom

### Components Used
- `Footer` from `@/components/Footer`
- Lucide React icons: `Phone`, `Instagram`, `Music2`
- Framer Motion for animations

### Links
- Internal links: `/apply`, `/explore`
- External links: Instagram, TikTok (with proper `rel="noopener noreferrer"`)
- Phone link: Direct dial capability

## Accessibility

### Best Practices
- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- Descriptive link text
- External links open in new tabs with proper attributes
- Keyboard navigation friendly

## Testing

### Manual Testing Checklist
1. Navigate to `http://localhost:3000/contact`
2. Verify all three contact methods display correctly
3. Test phone link on mobile device
4. Test Instagram link opens in new tab
5. Test TikTok link opens in new tab
6. Verify "Apply to Curate" button links to `/apply`
7. Verify "Explore Stores" button links to `/explore`
8. Test responsive behavior:
   - Mobile (< 768px): Single column layout
   - Tablet (768px - 1024px): Grid layout
   - Desktop (> 1024px): Full three-column grid
9. Verify animations work smoothly
10. Test hover effects on contact cards

## Customization

### Updating Contact Information
To update the contact information, modify the `contactMethods` array in `/app/contact/page.tsx`:

```typescript
const contactMethods = [
  {
    icon: Phone,
    label: 'Phone',
    value: '+51 957 566 408',  // Update phone number here
    href: 'tel:+51957566408',   // Update tel link here
    description: 'Call us directly'
  },
  // ... other methods
]
```

### Adding New Contact Methods
1. Import the appropriate icon from lucide-react
2. Add a new object to the `contactMethods` array
3. Follow the same structure as existing methods

### Styling Modifications
The page uses Tailwind CSS classes. Common modifications:
- Background colors: Modify `bg-*` classes
- Spacing: Adjust `py-*`, `px-*`, `gap-*` classes
- Typography: Update `text-*` classes
- Animations: Modify Framer Motion variants

## Dependencies
- Next.js 14
- React 18
- Framer Motion (for animations)
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Future Enhancements
Potential improvements for the contact page:
1. Add a contact form for direct message submission
2. Include a map showing office location
3. Add live chat integration
4. Display real-time response status
5. Add email contact option
6. Integrate with CRM system
7. Add FAQ section
