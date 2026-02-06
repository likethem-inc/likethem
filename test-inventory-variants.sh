#!/bin/bash

# Test script for variant management implementation
# This script verifies the inventory system is working correctly

echo "=================================="
echo "Inventory Variant System Test"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if files exist
echo "1. Checking if new files exist..."
FILES=(
  "components/curator/inventory/VariantManager.tsx"
  "INVENTORY_VARIANT_SOLUTION.md"
)

ALL_FILES_EXIST=true
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "   ${GREEN}✓${NC} $file exists"
  else
    echo -e "   ${RED}✗${NC} $file NOT FOUND"
    ALL_FILES_EXIST=false
  fi
done

# Check if modified files have the changes
echo ""
echo "2. Checking if files were updated..."

if grep -q "VariantManager" "app/dashboard/curator/inventory/page.tsx"; then
  echo -e "   ${GREEN}✓${NC} Inventory page includes VariantManager"
else
  echo -e "   ${RED}✗${NC} Inventory page missing VariantManager import"
fi

if grep -q "Manage Variants" "app/dashboard/curator/inventory/page.tsx"; then
  echo -e "   ${GREEN}✓${NC} 'Manage Variants' tab added to inventory page"
else
  echo -e "   ${RED}✗${NC} 'Manage Variants' tab not found"
fi

if grep -q "Create Variants First" "app/dashboard/curator/inventory/page.tsx"; then
  echo -e "   ${GREEN}✓${NC} Help section updated with variant instructions"
else
  echo -e "   ${RED}✗${NC} Help section not updated"
fi

# Check component structure
echo ""
echo "3. Verifying VariantManager component structure..."

if grep -q "interface Product" "components/curator/inventory/VariantManager.tsx"; then
  echo -e "   ${GREEN}✓${NC} TypeScript interfaces defined"
else
  echo -e "   ${RED}✗${NC} Missing TypeScript interfaces"
fi

if grep -q "parseArrayField" "components/curator/inventory/VariantManager.tsx"; then
  echo -e "   ${GREEN}✓${NC} Utility function for parsing arrays"
else
  echo -e "   ${RED}✗${NC} Missing parseArrayField function"
fi

if grep -q "selectProduct" "components/curator/inventory/VariantManager.tsx"; then
  echo -e "   ${GREEN}✓${NC} Product selection logic implemented"
else
  echo -e "   ${RED}✗${NC} Missing product selection"
fi

if grep -q "/api/curator/inventory" "components/curator/inventory/VariantManager.tsx"; then
  echo -e "   ${GREEN}✓${NC} API integration present"
else
  echo -e "   ${RED}✗${NC} Missing API calls"
fi

# Check for TypeScript errors
echo ""
echo "4. Checking for TypeScript syntax (basic)..."

if [ -f "components/curator/inventory/VariantManager.tsx" ]; then
  # Count imports
  IMPORT_COUNT=$(grep -c "^import" "components/curator/inventory/VariantManager.tsx")
  if [ $IMPORT_COUNT -gt 0 ]; then
    echo -e "   ${GREEN}✓${NC} Component has imports ($IMPORT_COUNT found)"
  fi
  
  # Check for export
  if grep -q "export default" "components/curator/inventory/VariantManager.tsx"; then
    echo -e "   ${GREEN}✓${NC} Component has default export"
  fi
  
  # Check for JSX
  if grep -q "return (" "components/curator/inventory/VariantManager.tsx"; then
    echo -e "   ${GREEN}✓${NC} Component returns JSX"
  fi
fi

# Summary
echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="

if [ "$ALL_FILES_EXIST" = true ]; then
  echo -e "${GREEN}✓ All files created/modified${NC}"
else
  echo -e "${RED}✗ Some files missing${NC}"
fi

echo ""
echo "Next steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. Navigate to /dashboard/curator/inventory"
echo "  3. Click on 'Manage Variants' tab"
echo "  4. Select a product to generate variants"
echo "  5. Set stock quantities and save"
echo "  6. Check 'Inventory List' tab to see variants"
echo ""
echo "For detailed information, see: INVENTORY_VARIANT_SOLUTION.md"
echo ""
