# Publication Status Feature - Implementation Guide

## 📋 Overview
This document provides a comprehensive analysis of the codebase for implementing the publication status (active/inactive) feature for curators.

## ✅ Current State Analysis

### 1. Database Schema (Prisma)
**File:** `/prisma/schema.prisma`

The `Product` model already has an `isActive` field:
```prisma
model Product {
  id            String         @id @default(cuid())
  curatorId     String
  title         String
  description   String
  price         Float
  category      String
  tags          String
  sizes         String
  colors        String
  stockQuantity Int            @default(0)
  isActive      Boolean        @default(true)   // ✅ Already exists!
  isFeatured    Boolean        @default(false)
  curatorNote   String?
  slug          String         @unique
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  // ... relations
}
```

**Status:** ✅ **No database migration needed!**

---

## 📁 Key Files Identified

### Frontend Components

#### 1. **Product Cards in Curator Dashboard**
**File:** `/app/dashboard/curator/products/page.tsx`

**Current State:**
- ✅ Already displays products with status badges
- ✅ Has status filter (all/active/inactive)
- ✅ Shows status indicator on product cards (lines 285-296)
- ❌ Three-dot menu button exists but has no dropdown (line 305)
- ❌ `toggleProductStatus()` function is a TODO (lines 136-139)

**Key Observations:**
```tsx
// Line 305 - Three-dot menu button exists
<button className="p-1 text-gray-400 hover:text-carbon">
  <MoreVertical className="w-4 h-4" />
</button>

// Lines 136-139 - Status toggle is a TODO
const toggleProductStatus = (productId: string) => {
  // TODO: Implement status toggle
  console.log('Toggle status for product:', productId)
}
```

#### 2. **Public Curator Page (Store Front)**
**File:** `/app/curator/[curatorSlug]/page.tsx`

**Current State:**
- ✅ Already filters out inactive products (line 52)
```tsx
products: {
  where: { isActive: true },  // ✅ Only active products shown
  include: { images: { orderBy: { order: 'asc' } } },
  orderBy: { createdAt: 'desc' }
}
```

#### 3. **Individual Product Page**
**File:** `/app/curator/[curatorSlug]/product/[productSlug]/page.tsx`

**Current State:**
- ✅ Already checks if product is inactive (lines 96-113)
- ✅ Returns "product_inactive" error
- ✅ Shows `ProductUnavailable` component with "inactive" reason
```tsx
if (!product.isActive) {
  return {
    error: 'product_inactive',
    correlationId,
    curator: { ... }
  };
}
```

#### 4. **Product Unavailable Component**
**File:** `/components/product/ProductUnavailable.tsx` (needs to be verified/viewed)

---

### Backend API Endpoints

#### 1. **Get Curator's Products**
**File:** `/app/api/products/route.ts`

**Current State:**
- ✅ Returns all products (active and inactive) for curator
- ✅ Includes `isActive` field in response
- No filtering needed - curator should see all their products

#### 2. **Get Single Product (Public)**
**File:** `/app/api/products/[slug]/route.ts`

**Current State:**
- ✅ Already hides inactive products from public (lines 43-49)
```tsx
if (!product.isActive) {
  return NextResponse.json(
    { error: 'Product not found' },
    { status: 404 }
  )
}
```

#### 3. **Update Product (Curator)**
**File:** `/app/api/curator/products/[id]/route.ts`

**Current State:**
- ✅ Has PUT endpoint for product updates
- ❌ Does NOT include `isActive` field in update logic
- Uses transaction for updates (lines 134-176)

#### 4. **Admin Status Endpoint (Reference)**
**File:** `/app/api/admin/products/[id]/status/route.ts`

**Current State:**
- ✅ Shows pattern for status updates
- Uses POST method to update status
- Validates status values
- Logs changes with correlation ID

---

## 🎯 Implementation Requirements

### Requirement 1: Add Toggle Option to Three-Dot Menu
**Status:** ⚠️ Menu button exists but no dropdown

**What needs to be done:**
1. Create dropdown menu component (or use existing pattern)
2. Add menu items:
   - "Mark as Active" / "Mark as Inactive" (conditional)
   - "View" (link to product page)
   - "Edit" (link to edit page)
   - "Delete" (existing button)
3. Add state for menu visibility per product
4. Implement click handlers

### Requirement 2: Hide Inactive Products from Public Store
**Status:** ✅ **Already Implemented!**

- Curator page already filters: `where: { isActive: true }`
- Public product page already returns 404 for inactive products
- No changes needed

### Requirement 3: Show "Producto Inactivo" Message
**Status:** ✅ **Already Implemented!**

- Product page detects inactive status and shows `ProductUnavailable` component
- Component receives `reason="inactive"` prop
- Shows curator info and link back to store
- May need to verify Spanish translation

---

## 🔧 Implementation Plan

### Phase 1: Create Status Toggle API Endpoint

**New File:** `/app/api/curator/products/[id]/status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

// PATCH /api/curator/products/[id]/status - Toggle product status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const correlationId = `curator-product-status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    requireApiRole(user, 'CURATOR')

    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return createApiErrorResponse('isActive must be a boolean', 400)
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get product and verify ownership
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!product) {
      return createApiErrorResponse('Product not found', 404)
    }

    if (product.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to update this product', 403)
    }

    // Update status
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: { isActive }
    })

    console.log(`[CURATOR_PRODUCT_STATUS][${correlationId}]`, {
      curatorId: curatorProfile.id,
      productId: params.id,
      productTitle: product.title,
      oldStatus: product.isActive,
      newStatus: isActive,
    })

    return createApiSuccessResponse({
      message: 'Product status updated successfully',
      product: {
        id: updatedProduct.id,
        isActive: updatedProduct.isActive
      }
    })
  } catch (error) {
    console.error(`[CURATOR_PRODUCT_STATUS][${correlationId}][ERROR]`, error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}
```

### Phase 2: Create Dropdown Menu Component

**New File:** `/components/curator/ProductDropdownMenu.tsx`

```typescript
'use client'

import { useState } from 'react'
import { MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface ProductDropdownMenuProps {
  productId: string
  isActive: boolean
  onStatusChange: (productId: string, newStatus: boolean) => Promise<void>
  onDelete: (productId: string) => void
}

export default function ProductDropdownMenu({
  productId,
  isActive,
  onStatusChange,
  onDelete
}: ProductDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusToggle = async () => {
    setIsUpdating(true)
    try {
      await onStatusChange(productId, !isActive)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = () => {
    setIsOpen(false)
    onDelete(productId)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-carbon transition-colors"
        aria-label="Product actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
            <Link
              href={`/product/${productId}`}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-4 h-4" />
              <span>View Product</span>
            </Link>

            <Link
              href={`/dashboard/curator/products/${productId}/edit`}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Product</span>
            </Link>

            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isActive ? (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>{isUpdating ? 'Updating...' : 'Mark as Inactive'}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isUpdating ? 'Updating...' : 'Mark as Active'}</span>
                </>
              )}
            </button>

            <hr className="my-1" />

            <button
              onClick={handleDelete}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

### Phase 3: Update Products Page Component

**File:** `/app/dashboard/curator/products/page.tsx`

**Changes needed:**

1. Import the new dropdown component
2. Replace `toggleProductStatus` function with actual API call
3. Add state management for status updates
4. Replace the three-dot button with the dropdown component

**Key changes:**
```typescript
// Add state for updating
const [updatingProducts, setUpdatingProducts] = useState<Set<string>>(new Set())

// Replace TODO function with actual implementation
const toggleProductStatus = async (productId: string, newStatus: boolean) => {
  setUpdatingProducts(prev => new Set(prev).add(productId))
  
  try {
    const response = await fetch(`/api/curator/products/${productId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isActive: newStatus })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update status')
    }
    
    // Update local state
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isActive: newStatus } : p
    ))
    
    // Show success toast/notification
  } catch (error) {
    console.error('Failed to update product status:', error)
    // Show error toast/notification
  } finally {
    setUpdatingProducts(prev => {
      const next = new Set(prev)
      next.delete(productId)
      return next
    })
  }
}

// Replace the three-dot button with dropdown
<ProductDropdownMenu
  productId={product.id}
  isActive={product.isActive}
  onStatusChange={toggleProductStatus}
  onDelete={deleteProduct}
/>
```

### Phase 4: Verify ProductUnavailable Component

**File to check:** `/components/product/ProductUnavailable.tsx`

Ensure it handles the "inactive" reason properly and displays appropriate Spanish text.

---

## 🌐 Internationalization Notes

The codebase uses i18n with locale files in `/locales/`. Need to add translations:

**Keys to add:**
- `products.status.active`
- `products.status.inactive`
- `products.actions.markActive`
- `products.actions.markInactive`
- `products.unavailable.inactive.title`
- `products.unavailable.inactive.message`

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Three-dot menu opens/closes correctly
- [ ] Status toggle updates UI immediately (optimistic update)
- [ ] Status badge reflects current state
- [ ] Filter works with active/inactive products
- [ ] Menu closes after action
- [ ] Loading state shows during update

### Backend Tests
- [ ] Status endpoint requires authentication
- [ ] Status endpoint validates curator ownership
- [ ] Status endpoint validates boolean value
- [ ] Status update persists in database
- [ ] Status change is logged

### Integration Tests
- [ ] Inactive products don't appear on public curator page
- [ ] Inactive product URL returns "product inactive" message
- [ ] Active products appear normally
- [ ] Status changes reflect immediately in all views

---

## 🎨 UI/UX Considerations

### Design Patterns to Follow
1. **Dropdown Menu:** Follow existing patterns in the codebase (check admin components)
2. **Loading States:** Use existing skeleton/spinner patterns
3. **Error Messages:** Use Toast component (`/components/Toast.tsx`)
4. **Color Scheme:** 
   - Active: green-100/green-800 (already used)
   - Inactive: red-100/red-800 (already used)
   - Hover: gray-50
5. **Icons:** Use lucide-react (already imported)

### Accessibility
- Use proper ARIA labels
- Keyboard navigation support
- Focus management for dropdown
- Screen reader announcements for status changes

---

## 📊 Current Architecture Summary

```
Frontend (Curator Dashboard)
├── /app/dashboard/curator/products/page.tsx
│   ├── Displays product cards with status badges ✅
│   ├── Has three-dot menu button ✅
│   ├── Status filter works ✅
│   └── Toggle function is TODO ❌
│
└── Component needed:
    └── ProductDropdownMenu.tsx (new) ❌

API Endpoints
├── GET /api/products
│   └── Returns all curator products ✅
│
└── PATCH /api/curator/products/[id]/status (new) ❌

Public Views (Already Working)
├── /app/curator/[slug]/page.tsx
│   └── Filters isActive: true ✅
│
└── /app/curator/[slug]/product/[slug]/page.tsx
    └── Shows ProductUnavailable for inactive ✅

Database
└── Product.isActive field exists ✅
```

---

## 🚀 Estimated Effort

- **API Endpoint:** 30 minutes
- **Dropdown Component:** 1 hour
- **Products Page Integration:** 1 hour  
- **Testing & Refinement:** 1 hour
- **i18n Translations:** 30 minutes

**Total:** ~4 hours

---

## 📝 Additional Notes

1. **No breaking changes** - All public-facing features already work correctly
2. **Database ready** - `isActive` field exists, no migration needed
3. **Most logic exists** - Just need to wire up the UI to the API
4. **Pattern exists** - Admin status endpoint provides reference implementation
5. **Translations needed** - Add Spanish text for new UI elements

---

## 🔍 Next Steps

1. **Review ProductUnavailable component** to verify inactive product message
2. **Create dropdown menu component** with proper styling
3. **Implement status toggle API endpoint**
4. **Update products page** to use dropdown and call API
5. **Add i18n translations**
6. **Test all scenarios**
7. **Deploy and monitor**

