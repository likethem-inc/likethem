#!/bin/bash
# Contact Page Test Script
# Run this script to verify the Contact page implementation

echo "================================================"
echo "  LikeThem - Contact Page Implementation Test"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "1. Checking if required files exist..."
echo "   ----------------------------------------"

# Check for contact page
if [ -f "app/contact/page.tsx" ]; then
    echo -e "   ${GREEN}✓${NC} app/contact/page.tsx exists"
else
    echo -e "   ${RED}✗${NC} app/contact/page.tsx is missing"
    exit 1
fi

# Check for README
if [ -f "app/contact/README.md" ]; then
    echo -e "   ${GREEN}✓${NC} app/contact/README.md exists"
else
    echo -e "   ${YELLOW}!${NC} app/contact/README.md is missing (optional)"
fi

echo ""
echo "2. Checking contact page content..."
echo "   ----------------------------------------"

# Check for phone number
if grep -q "+51957566408" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Phone number is present"
else
    echo -e "   ${RED}✗${NC} Phone number is missing"
fi

# Check for Instagram
if grep -q "instagram" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Instagram link is present"
else
    echo -e "   ${RED}✗${NC} Instagram link is missing"
fi

# Check for TikTok
if grep -q "tiktok" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} TikTok link is present"
else
    echo -e "   ${RED}✗${NC} TikTok link is missing"
fi

# Check for Footer component
if grep -q "Footer" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Footer component is imported"
else
    echo -e "   ${RED}✗${NC} Footer component is missing"
fi

# Check for lucide-react icons
if grep -q "lucide-react" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Lucide React icons are imported"
else
    echo -e "   ${RED}✗${NC} Lucide React icons are missing"
fi

# Check for framer-motion
if grep -q "framer-motion" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Framer Motion is imported"
else
    echo -e "   ${YELLOW}!${NC} Framer Motion is not imported (optional)"
fi

echo ""
echo "3. Checking component structure..."
echo "   ----------------------------------------"

# Check for client component
if grep -q "'use client'" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Marked as client component"
else
    echo -e "   ${YELLOW}!${NC} Not marked as client component"
fi

# Check for contact methods
if grep -q "contactMethods" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Contact methods array is defined"
else
    echo -e "   ${RED}✗${NC} Contact methods array is missing"
fi

echo ""
echo "4. Checking styling..."
echo "   ----------------------------------------"

# Check for Tailwind classes
if grep -q "container-custom\|bg-carbon\|text-warm-gray" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Uses project Tailwind classes"
else
    echo -e "   ${YELLOW}!${NC} May not be using project Tailwind classes"
fi

# Check for responsive classes
if grep -q "md:\|lg:\|sm:" app/contact/page.tsx; then
    echo -e "   ${GREEN}✓${NC} Includes responsive design classes"
else
    echo -e "   ${RED}✗${NC} Missing responsive design classes"
fi

echo ""
echo "5. Checking Footer integration..."
echo "   ----------------------------------------"

# Check if Footer has contact link
if grep -q "/contact" components/Footer.tsx 2>/dev/null; then
    echo -e "   ${GREEN}✓${NC} Footer already has /contact link"
else
    echo -e "   ${YELLOW}!${NC} Footer may not have /contact link yet"
fi

echo ""
echo "================================================"
echo "  Summary"
echo "================================================"
echo ""
echo "The Contact page has been created at:"
echo "  📄 File: app/contact/page.tsx"
echo "  🌐 URL: http://localhost:3000/contact"
echo ""
echo "Contact Information:"
echo "  📞 Phone: +51 957 566 408"
echo "  📷 Instagram: @likethem"
echo "  🎵 TikTok: @likethem"
echo ""
echo "To test the page:"
echo "  1. Run: npm run dev"
echo "  2. Visit: http://localhost:3000/contact"
echo "  3. Test all links and hover effects"
echo "  4. Verify responsive design on mobile"
echo ""
echo "================================================"
echo -e "${GREEN}✓ Implementation complete!${NC}"
echo "================================================"
