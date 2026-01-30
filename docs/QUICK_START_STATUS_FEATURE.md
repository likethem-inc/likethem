# ⚡ Quick Start: Publication Status Feature

## 🎯 Summary
Implement status toggle (active/inactive) for products in curator dashboard. 

**Good News:** Feature is 80% done! Just need to connect UI to API.

---

## ✅ What Already Works

1. ✅ Database has `Product.isActive` field
2. ✅ Public pages hide inactive products
3. ✅ Inactive product page shows "Esta pieza ha sido vendida" message
4. ✅ Dashboard shows status badges
5. ✅ Status filter works

---

## ❌ What Needs Building (3 hours)

### 1️⃣ Create API Endpoint (30 min)

**File:** `app/api/curator/products/[id]/status/route.ts`

Copy pattern from: `app/api/admin/products/[id]/status/route.ts`

Key changes:
- Use `getApiUser()` instead of `requireAdmin()`
- Verify curator owns the product
- Accept `{ isActive: boolean }` in body
- Use PATCH method

### 2️⃣ Create Dropdown Component (1 hour)

**File:** `components/curator/ProductDropdownMenu.tsx`

Features:
- Three-dot button
- Menu with: View, Edit, Toggle Status, Delete
- Loading state during API call
- Close on outside click

### 3️⃣ Wire Up Dashboard (1 hour)

**File:** `app/dashboard/curator/products/page.tsx`

Changes needed:
1. Import `ProductDropdownMenu`
2. Replace `toggleProductStatus` TODO (line 136) with API call
3. Replace three-dot button (line 305) with dropdown component

### 4️⃣ Test (30 min)

- Toggle status in dashboard
- Verify badge updates
- Check public page hides/shows product
- Visit inactive product URL directly
- Toggle back to active

---

## 📂 Key Files Reference

### Already Complete ✅
- `prisma/schema.prisma` - Line 129 has isActive
- `app/curator/[curatorSlug]/page.tsx` - Line 52 filters isActive
- `app/curator/[curatorSlug]/product/[productSlug]/page.tsx` - Lines 96-113 handle inactive
- `components/product/ProductUnavailable.tsx` - Lines 27-36 show message
- `locales/es/common.json` - Has Spanish translations

### Need Updates ⚠️
- `app/dashboard/curator/products/page.tsx` - Lines 136, 305
- `app/api/curator/products/[id]/status/route.ts` - CREATE NEW

### Reference ℹ️
- `app/api/admin/products/[id]/status/route.ts` - Pattern to follow

---

## 🔧 Code Snippets

### API Endpoint
```typescript
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getApiUser(request)
  requireApiRole(user, 'CURATOR')
  
  const { isActive } = await request.json()
  
  // Verify ownership
  const curatorProfile = await prisma.curatorProfile.findUnique({ where: { userId: user.id } })
  const product = await prisma.product.findUnique({ where: { id: params.id } })
  
  if (product.curatorId !== curatorProfile.id) {
    return createApiErrorResponse('Unauthorized', 403)
  }
  
  // Update
  await prisma.product.update({
    where: { id: params.id },
    data: { isActive }
  })
  
  return createApiSuccessResponse({ message: 'Updated' })
}
```

### Toggle Function
```typescript
const toggleProductStatus = async (productId: string, newStatus: boolean) => {
  const response = await fetch(`/api/curator/products/${productId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive: newStatus })
  })
  
  if (!response.ok) throw new Error('Failed to update')
  
  setProducts(products.map(p => 
    p.id === productId ? { ...p, isActive: newStatus } : p
  ))
}
```

### Dropdown Component
```tsx
<ProductDropdownMenu
  productId={product.id}
  isActive={product.isActive}
  onStatusChange={toggleProductStatus}
  onDelete={deleteProduct}
/>
```

---

## 🧪 Testing Steps

1. **Dashboard:** Toggle status → Badge changes
2. **Public Store:** Inactive product hidden
3. **Direct URL:** Shows "Esta pieza ha sido vendida"
4. **Toggle Back:** Product reappears on public store

---

## 🎨 UI Notes

- Active: Green badge (bg-green-100, text-green-800)
- Inactive: Red badge (bg-red-100, text-red-800)
- Menu: White, rounded-lg, shadow-lg
- Use `lucide-react` icons: MoreVertical, Eye, Edit, CheckCircle, XCircle, Trash2

---

## 📝 No Database Migration Needed!

The `isActive` field already exists. Just connect the UI to it.

---

## 🚀 Priority Order

1. API endpoint (blocks everything)
2. Dropdown component (reusable)
3. Dashboard integration (wires it up)
4. Testing (validates it works)

---

Ready to implement! See full documentation in `docs/PUBLICATION_STATUS_FEATURE.md` for detailed code.
