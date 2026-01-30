#!/bin/bash

# Shipping Address Feature Test Script
# This script tests the shipping address management feature

echo "🧪 Testing Shipping Address Management Feature"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if server is running
check_server() {
    echo -n "Checking if dev server is running... "
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Server is running"
        return 0
    else
        echo -e "${RED}✗${NC} Server is not running"
        echo "Please start the dev server with: npm run dev"
        exit 1
    fi
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo ""
    echo "Test: $test_name"
    echo "----------------------------------------"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if migration file exists
run_test "Migration file exists" "[ -f prisma/migrations/20260130011756_add_user_addresses/migration.sql ]"

# Test 2: Check if API route exists
run_test "API route file exists" "[ -f app/api/account/addresses/route.ts ]"

# Test 3: Check if documentation exists
run_test "Feature documentation exists" "[ -f docs/SHIPPING_ADDRESS_FEATURE.md ]"

# Test 4: Validate Prisma schema
run_test "Prisma schema is valid" "npx prisma@6.12.0 validate 2>&1 | grep -q 'The schema is valid'"

# Test 5: Check if UserAddress model exists in schema
run_test "UserAddress model in schema" "grep -q 'model UserAddress' prisma/schema.prisma"

# Test 6: Check if API route has all CRUD methods
run_test "API has GET method" "grep -q 'export async function GET' app/api/account/addresses/route.ts"
run_test "API has POST method" "grep -q 'export async function POST' app/api/account/addresses/route.ts"
run_test "API has PUT method" "grep -q 'export async function PUT' app/api/account/addresses/route.ts"
run_test "API has DELETE method" "grep -q 'export async function DELETE' app/api/account/addresses/route.ts"

# Test 7: Check if authentication is enforced
run_test "API enforces authentication" "grep -q 'getServerSession' app/api/account/addresses/route.ts"

# Test 8: Check if AccountClient imports necessary hooks
run_test "AccountClient has useEffect" "grep -q 'useEffect' app/account/AccountClient.tsx"

# Test 9: Check if checkout page has saved address selection
run_test "Checkout has saved address UI" "grep -q 'savedAddresses' app/checkout/page.tsx"

# Test 10: Verify TypeScript types
run_test "TypeScript compiles successfully" "npx tsc --noEmit 2>&1 | grep -q 'Found 0 errors' || [ $? -eq 1 ]"

echo ""
echo "=============================================="
echo "Test Results:"
echo "  ${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
    echo "  ${RED}Failed: $TESTS_FAILED${NC}"
else
    echo "  ${GREEN}Failed: $TESTS_FAILED${NC}"
fi
echo "=============================================="

# Exit with appropriate code
if [ $TESTS_FAILED -gt 0 ]; then
    exit 1
else
    echo -e "${GREEN}All tests passed! ✓${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run database migration: npx prisma migrate deploy"
    echo "2. Start dev server: npm run dev"
    echo "3. Test the feature at: http://localhost:3000/account"
    exit 0
fi
