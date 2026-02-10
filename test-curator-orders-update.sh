#!/bin/bash

# Curator Orders Dashboard Test Script
# This script helps verify the updates to the curator orders page

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Curator Orders Dashboard - Verification Script           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# File to check
FILE="app/dashboard/curator/orders/page.tsx"

echo "📋 Checking file: $FILE"
echo ""

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ File not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ File exists${NC}"
echo ""

# Check for new imports
echo "🔍 Checking imports..."
if grep -q "Truck, AlertTriangle, RefreshCw, RotateCcw" "$FILE"; then
    echo -e "${GREEN}✅ New icons imported (Truck, AlertTriangle, RefreshCw, RotateCcw)${NC}"
else
    echo -e "${RED}❌ Missing new icon imports${NC}"
fi

# Check for shipping info state
echo ""
echo "🔍 Checking state management..."
if grep -q "shippingInfo" "$FILE"; then
    echo -e "${GREEN}✅ shippingInfo state found${NC}"
else
    echo -e "${RED}❌ shippingInfo state not found${NC}"
fi

if grep -q "showShippingForm" "$FILE"; then
    echo -e "${GREEN}✅ showShippingForm state found${NC}"
else
    echo -e "${RED}❌ showShippingForm state not found${NC}"
fi

# Check for new status cases
echo ""
echo "🔍 Checking new statuses..."
STATUSES=("PROCESSING" "SHIPPED" "DELIVERED" "FAILED_ATTEMPT" "CANCELLED" "REFUNDED")
for status in "${STATUSES[@]}"; do
    if grep -q "case '$status'" "$FILE"; then
        echo -e "${GREEN}✅ $status status implemented${NC}"
    else
        echo -e "${RED}❌ $status status missing${NC}"
    fi
done

# Check for old statuses removed
echo ""
echo "🔍 Checking removed statuses..."
OLD_STATUSES=("PENDING_VERIFICATION" "CONFIRMED")
for status in "${OLD_STATUSES[@]}"; do
    if grep -q "case '$status'" "$FILE"; then
        echo -e "${RED}⚠️  $status status still present (should be removed)${NC}"
    else
        echo -e "${GREEN}✅ $status status removed${NC}"
    fi
done

# Check for shipping form fields
echo ""
echo "🔍 Checking shipping form..."
FORM_FIELDS=("courier" "trackingNumber" "estimatedDeliveryDate")
for field in "${FORM_FIELDS[@]}"; do
    if grep -q "$field" "$FILE"; then
        echo -e "${GREEN}✅ $field field found${NC}"
    else
        echo -e "${RED}❌ $field field not found${NC}"
    fi
done

# Check for handleShipOrder function
echo ""
echo "🔍 Checking functions..."
if grep -q "handleShipOrder" "$FILE"; then
    echo -e "${GREEN}✅ handleShipOrder function found${NC}"
else
    echo -e "${RED}❌ handleShipOrder function not found${NC}"
fi

# Check for action buttons
echo ""
echo "🔍 Checking action buttons..."
ACTION_BUTTONS=("Mark as Paid" "Reject Payment" "Start Processing" "Mark as Shipped" "Mark as Delivered" "Failed Attempt" "Retry Shipping")
for button in "${ACTION_BUTTONS[@]}"; do
    if grep -q "$button" "$FILE"; then
        echo -e "${GREEN}✅ '$button' button found${NC}"
    else
        echo -e "${RED}❌ '$button' button not found${NC}"
    fi
done

# Check for stats card update (PROCESSING instead of CONFIRMED)
echo ""
echo "🔍 Checking stats cards..."
if grep -q "filter(o => o.status === 'PROCESSING')" "$FILE"; then
    echo -e "${GREEN}✅ Stats card updated to show PROCESSING${NC}"
else
    echo -e "${YELLOW}⚠️  PROCESSING stats card might need verification${NC}"
fi

# Count total lines
echo ""
echo "📊 File Statistics:"
LINES=$(wc -l < "$FILE")
echo "   Total lines: $LINES"

# Check TypeScript interface
echo ""
echo "🔍 Checking TypeScript interface..."
if grep -q "courier\?: string" "$FILE" && grep -q "trackingNumber\?: string" "$FILE"; then
    echo -e "${GREEN}✅ Order interface updated with shipping fields${NC}"
else
    echo -e "${RED}❌ Order interface missing shipping fields${NC}"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Verification Summary                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "File: $FILE"
echo "Lines: $LINES"
echo ""
echo "✅ = Implemented correctly"
echo "❌ = Missing or incorrect"
echo "⚠️  = Needs verification"
echo ""

# Documentation check
echo "📚 Documentation Files:"
DOC_FILES=(
    "CURATOR_ORDERS_UPDATE.md"
    "CURATOR_ORDERS_VISUAL_GUIDE.md"
    "CURATOR_ORDERS_QUICK_REF.md"
    "CURATOR_ORDERS_COMPLETE.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✅ $doc${NC}"
    else
        echo -e "${RED}❌ $doc not found${NC}"
    fi
done

echo ""
echo "🧪 Next Steps:"
echo "1. Review the updated file: $FILE"
echo "2. Test the page in development environment"
echo "3. Update backend API to accept shipping fields"
echo "4. Update database schema if needed"
echo "5. Run full integration tests"
echo ""

echo "📖 Documentation:"
echo "- Full guide: CURATOR_ORDERS_UPDATE.md"
echo "- Visual reference: CURATOR_ORDERS_VISUAL_GUIDE.md"
echo "- Quick reference: CURATOR_ORDERS_QUICK_REF.md"
echo ""

echo "✨ Verification complete!"
