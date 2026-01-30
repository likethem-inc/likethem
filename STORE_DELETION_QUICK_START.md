# Store Deletion - Quick Start Guide

## 🚀 Quick Implementation Steps

### Step 1: Create Delete API Endpoint (15 minutes)

**File**: `/app/api/curator/store/delete/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs'

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Find curator profile
    const curator = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        orders: {
          select: { id: true }
        },
        collaborations1: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        },
        collaborations2: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        }
      }
    })

    if (!curator) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // 3. Check for orders (blocking constraint)
    if (curator.orders.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete store with existing orders',
          reason: 'orders_exist',
          orderCount: curator.orders.length,
          message: 'Your store has order history that must be preserved for business records.'
        },
        { status: 409 }
      )
    }

    // 4. Check for active collaborations
    const activeCollabs = [
      ...curator.collaborations1,
      ...curator.collaborations2
    ]
    
    if (activeCollabs.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete store with active collaborations',
          reason: 'collaborations_active',
          collaborationCount: activeCollabs.length,
          message: 'Please end all active collaborations before deleting your store.'
        },
        { status: 409 }
      )
    }

    // 5. Delete store in transaction
    await prisma.$transaction(async (tx) => {
      // Delete curator profile (cascades to products, follows, payment settings, etc.)
      await tx.curatorProfile.delete({
        where: { id: curator.id }
      })

      // Revert user role to BUYER
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: 'BUYER' }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully. Your account remains active and you can create a new store anytime.'
    })

  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

### Step 2: Create Check Endpoint (10 minutes)

**File**: `/app/api/curator/store/check-deletion/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const curator = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
            followers: true
          }
        },
        collaborations1: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        },
        collaborations2: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        }
      }
    })

    if (!curator) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const collaborationCount = 
      curator.collaborations1.length + curator.collaborations2.length

    const canDelete = curator._count.orders === 0 && collaborationCount === 0

    return NextResponse.json({
      canDelete,
      orderCount: curator._count.orders,
      collaborationCount,
      productCount: curator._count.products,
      followerCount: curator._count.followers,
      blockers: [
        ...(curator._count.orders > 0 ? ['orders'] : []),
        ...(collaborationCount > 0 ? ['collaborations'] : [])
      ]
    })
  } catch (error) {
    console.error('Error checking deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

### Step 3: Update Frontend (20 minutes)

**File**: `/app/dashboard/curator/settings/page.tsx`

#### A. Add State (after line 239)

```typescript
// Danger zone state
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [deleteConfirmation, setDeleteConfirmation] = useState('')
const [isDeleting, setIsDeleting] = useState(false)
const [deletionInfo, setDeletionInfo] = useState<{
  canDelete: boolean
  orderCount: number
  collaborationCount: number
  productCount: number
  followerCount: number
  blockers: string[]
} | null>(null)
```

#### B. Replace deleteAccount Function (lines 537-556)

```typescript
const checkStoreDeletion = async () => {
  try {
    const response = await fetch('/api/curator/store/check-deletion', {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to check deletion status')
    }
    
    const data = await response.json()
    setDeletionInfo(data)
    
    if (data.canDelete) {
      setShowDeleteModal(true)
    } else {
      let message = 'Cannot delete store:\n\n'
      if (data.orderCount > 0) {
        message += `• You have ${data.orderCount} order(s) that must be preserved\n`
      }
      if (data.collaborationCount > 0) {
        message += `• You have ${data.collaborationCount} active collaboration(s)\n`
        message += '  Please end them before deleting your store\n'
      }
      alert(message)
    }
  } catch (error) {
    console.error('Error checking deletion:', error)
    alert('Failed to check deletion status. Please try again.')
  }
}

const deleteStore = async () => {
  if (deleteConfirmation !== 'DELETE') {
    alert('Please type DELETE to confirm store deletion')
    return
  }

  setIsDeleting(true)
  
  try {
    const response = await fetch('/api/curator/store/delete', {
      method: 'DELETE',
      credentials: 'include'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to delete store')
    }

    // Success
    alert('✅ Store deleted successfully!\n\nYour account remains active and you can create a new store anytime.')
    
    // Redirect to home or apply page
    window.location.href = '/'
    
  } catch (error) {
    console.error('Error deleting store:', error)
    alert(`❌ ${error instanceof Error ? error.message : 'Failed to delete store'}`)
    setIsDeleting(false)
    setShowDeleteModal(false)
    setDeleteConfirmation('')
  }
}
```

#### C. Update UI (replace lines 1476-1498)

```tsx
<h2 className="text-2xl font-light mb-6">Danger Zone</h2>

<div className="border border-red-200 rounded-lg p-6 bg-red-50">
  <div className="flex items-start space-x-4">
    <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
    <div className="flex-1">
      <h3 className="text-lg font-medium text-red-900 mb-2">
        Delete Store
      </h3>
      <p className="text-red-700 mb-4">
        This action cannot be undone. This will permanently delete your store,
        all products, and followers. <strong>Your account will remain active</strong> and
        you can create a new store later.
      </p>

      {/* Info Box */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-red-100">
        <p className="font-medium text-gray-900 mb-2 flex items-center">
          <Trash2 className="w-4 h-4 mr-2" />
          What will be deleted:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm ml-6">
          <li>Store profile and branding</li>
          <li>All products {deletionInfo && `(${deletionInfo.productCount})`}</li>
          <li>Follower relationships {deletionInfo && `(${deletionInfo.followerCount})`}</li>
          <li>Payment settings</li>
          <li>Collaboration requests</li>
        </ul>
        
        <p className="font-medium text-gray-900 mt-3 mb-2 flex items-center">
          <Check className="w-4 h-4 mr-2 text-green-600" />
          What will be kept:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm ml-6">
          <li>Your user account and email</li>
          <li>Ability to create a new store</li>
        </ul>
      </div>

      {/* Warning Box - Only show if blockers exist */}
      {deletionInfo && !deletionInfo.canDelete && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-900 font-medium mb-2">
                Cannot delete store
              </p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                {deletionInfo.orderCount > 0 && (
                  <li>
                    You have <strong>{deletionInfo.orderCount}</strong> order(s).
                    Order history must be preserved for business records.
                  </li>
                )}
                {deletionInfo.collaborationCount > 0 && (
                  <li>
                    You have <strong>{deletionInfo.collaborationCount}</strong> active collaboration(s).
                    Please end them before deleting your store.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={checkStoreDeletion}
        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete My Store</span>
      </button>
    </div>
  </div>
</div>
```

#### D. Update Modal Title (line 1536)

```tsx
<h2 className="text-xl font-semibold text-red-900">Delete Store</h2>
```

```tsx
<p className="text-gray-700 mb-4">
  This action is irreversible. All your store data and products will be
  permanently deleted. <strong>Your account will remain active</strong> and
  you can create a new store anytime.
</p>
```

#### E. Update Modal Button (line 1570)

```tsx
<button
  onClick={deleteStore}  {/* Changed from deleteAccount */}
  disabled={deleteConfirmation !== 'DELETE' || isDeleting}
  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
>
  {isDeleting ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>Deleting Store...</span>
    </>
  ) : (
    <>
      <Trash2 className="w-4 h-4" />
      <span>Confirm Deletion</span>
    </>
  )}
</button>
```

---

## 🧪 Testing Checklist

### Test Case 1: Successful Deletion
```bash
# Setup: Create curator with only products and followers
# Expected: Store deleted, user reverted to BUYER

1. Login as curator
2. Go to Settings > Danger Zone
3. Click "Delete My Store"
4. Should show deletion info (products, followers count)
5. Type "DELETE" and confirm
6. Should redirect to homepage
7. Try accessing curator dashboard - should fail
8. User role should be BUYER
```

### Test Case 2: Blocked by Orders
```bash
# Setup: Curator with at least 1 order
# Expected: Deletion prevented

1. Login as curator with orders
2. Go to Settings > Danger Zone
3. Click "Delete My Store"
4. Should show yellow warning box
5. Should display order count
6. Deletion should be blocked
```

### Test Case 3: Blocked by Collaborations
```bash
# Setup: Curator with active collaboration
# Expected: Deletion prevented

1. Login as curator with active collaboration
2. Go to Settings > Danger Zone
3. Click "Delete My Store"
4. Should show yellow warning box
5. Should display collaboration count
6. Deletion should be blocked
```

### Test Case 4: Re-creation
```bash
# Setup: After successful store deletion
# Expected: Can create new store

1. After deletion, go to /curator/apply
2. Fill out application
3. Admin approves
4. Should be able to create new curator profile
5. Can access curator dashboard again
```

---

## 📊 What Gets Deleted (Cascade)

```
CuratorProfile (Deleted)
├── Products (CASCADE)
│   ├── ProductImages (CASCADE)
│   ├── CartItems (CASCADE) ← Buyers' carts cleared
│   ├── Favorites (CASCADE)
│   ├── WishlistItems (CASCADE)
│   └── OrderItems (CASCADE via Order)
├── Follow (CASCADE) ← Followers removed
├── CollaborationRequests (CASCADE)
├── PaymentSettings (CASCADE)
└── User.role → 'BUYER' (Updated)

⚠️ NOT Deleted (Prevents Deletion):
├── Orders (RESTRICT) ← Blocks deletion
└── Collaborations (RESTRICT) ← Blocks deletion
```

---

## 🐛 Common Issues

### Issue 1: Foreign Key Constraint Error
```
Error: Foreign key constraint failed
```
**Cause**: Orders or Collaborations exist
**Solution**: Already handled - API returns 409 with clear message

### Issue 2: Session Not Found
```
Error: Unauthorized
```
**Cause**: User not logged in or session expired
**Solution**: Frontend should check session before showing danger zone

### Issue 3: Store Not Found
```
Error: Store not found
```
**Cause**: User doesn't have curator profile
**Solution**: UI should only show for active curators

---

## 📝 Summary

### Files Created
1. ✅ `/app/api/curator/store/delete/route.ts` (~100 lines)
2. ✅ `/app/api/curator/store/check-deletion/route.ts` (~60 lines)

### Files Modified
1. ✅ `/app/dashboard/curator/settings/page.tsx`
   - Add `deletionInfo` state
   - Add `checkStoreDeletion()` function
   - Replace `deleteAccount()` with `deleteStore()`
   - Update all UI text and warnings
   - Update modal content

### Total Changes
- **New code**: ~160 lines
- **Modified code**: ~100 lines
- **Time estimate**: 45-60 minutes

### Business Rules
- ✅ Cannot delete if orders exist (preserves business records)
- ✅ Cannot delete if active collaborations exist (requires manual end)
- ✅ User role reverts to BUYER
- ✅ User can immediately create new store
- ✅ All products, followers, settings cascade delete

---

## 🎯 Next Steps

1. **Create the two API files** in `/app/api/curator/store/`
2. **Update the settings page** with new functions and UI
3. **Test locally** with all 4 test cases
4. **Deploy** and monitor for errors
5. **Optional**: Add email notification on deletion
6. **Optional**: Add audit log for compliance

---

*Ready to implement! Follow steps 1-3 in order.* 🚀
