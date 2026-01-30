# Store Deletion Feature - Comprehensive Analysis

## 📋 Executive Summary

The current "Danger Zone" in curator settings has a **non-functional** delete button that simulates account deletion but doesn't actually perform any operation. You want to implement **store deletion** (not account deletion) so curators can delete their store while keeping their user account active to create a new store later.

### Current Status: ❌ NOT IMPLEMENTED
- Frontend UI exists but is misleading (says "Delete Account")
- No API endpoint exists for deletion
- Function only simulates with `setTimeout`, no actual deletion occurs
- Would fail if attempted due to database constraints

---

## 🗂️ Database Schema Analysis

### CuratorProfile Model
**Location**: `/prisma/schema.prisma` (lines 75-118)

```prisma
model CuratorProfile {
  id                String         @id @default(cuid())
  userId            String         @unique
  storeName         String
  slug              String         @unique
  bio               String?
  avatarImage       String?
  bannerImage       String?
  
  // Social links
  instagram         String?
  tiktok            String?
  youtube           String?
  twitter           String?
  websiteUrl        String?
  
  // Settings
  isPublic          Boolean        @default(true)
  notifyFollowers   Boolean        @default(true)
  // ... other notification flags
  
  // Relationships
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  products          Product[]
  orders            Order[]        @relation("CuratorOrders")
  followers         Follow[]
  collaborations1   Collaboration[] @relation("CuratorCollaborations1")
  collaborations2   Collaboration[] @relation("CuratorCollaborations2")
  paymentSettings   PaymentSettings?
  
  @@map("curator_profiles")
}
```

### Related Models & Cascade Behavior

#### ✅ WILL AUTO-DELETE (onDelete: Cascade)
1. **Product** (line 141)
   - Cascade deletes → ProductImage, CartItem, Favorite, OrderItem, WishlistItem
   
2. **Follow** (line 297)
   - Followers list will be cleared
   
3. **CollaborationRequest** (lines 268-269)
   - Both sent and received collaboration requests
   
4. **PaymentSettings** (line 353)
   - Payment configuration (Yape, Plin, Stripe settings)

#### ⚠️ WILL CAUSE ERRORS (No onDelete clause)
1. **Order** (line 176)
   ```prisma
   curator CuratorProfile @relation("CuratorOrders", fields: [curatorId], references: [id])
   ```
   - **No onDelete specified** = Default behavior is RESTRICT
   - PostgreSQL will **reject deletion** if orders exist
   - Orders contain critical business data (payments, shipping, buyer info)

2. **Collaboration** (lines 252-253)
   ```prisma
   curator1 CuratorProfile @relation("CuratorCollaborations1", fields: [curator1Id], references: [id])
   curator2 CuratorProfile @relation("CuratorCollaborations2", fields: [curator2Id], references: [id])
   ```
   - **No onDelete specified** = Default behavior is RESTRICT
   - Cannot delete if curator is in any collaboration

---

## 🎯 Current Frontend Implementation

### File: `/app/dashboard/curator/settings/page.tsx`
**Size**: 1,593 lines

### Danger Zone Section (Lines 1469-1590)

```tsx
{/* Danger Zone Tab */}
{activeTab === 'danger' && (
  <motion.div>
    <h2>Danger Zone</h2>
    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
      <AlertTriangle className="w-6 h-6 text-red-600" />
      <h3>Delete Account</h3> {/* ❌ MISLEADING: Should say "Delete Store" */}
      <p>
        This action cannot be undone. This will permanently delete your account, 
        remove all your products, collaborations, and data from LikeThem.
      </p>
      <button onClick={() => setShowDeleteModal(true)}>
        Delete My Account {/* ❌ MISLEADING */}
      </button>
    </div>
  </motion.div>
)}
```

### Delete Function (Lines 537-556)

```tsx
const deleteAccount = async () => {
  if (deleteConfirmation !== 'DELETE') {
    alert('Please type DELETE to confirm account deletion')
    return
  }

  setIsDeleting(true)
  
  // ❌ NO ACTUAL API CALL - Just a simulation
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  console.log('Deleting account...') // ❌ Only logs to console
  
  setIsDeleting(false)
  setShowDeleteModal(false)
  setDeleteConfirmation('')
  
  // ❌ Just redirects, nothing actually deleted
  window.location.href = '/'
}
```

**Issues**:
1. ❌ No API call to backend
2. ❌ Misleading text (says "account" but should be "store")
3. ❌ No validation checks (orders, collaborations)
4. ❌ Doesn't actually delete anything
5. ❌ Would fail if attempted due to DB constraints

---

## 🔧 Existing API Endpoints

### GET /api/curator/profile
**File**: `/app/api/curator/profile/route.ts` (lines 13-69)
- Fetches current curator's profile
- Returns transformed profile with null handling

### POST /api/curator/profile
**File**: `/app/api/curator/profile/route.ts` (lines 72-183)
- **Creates new curator profile**
- Validates store name and bio required
- Checks for existing profile (prevents duplicates)
- Generates unique slug from store name
- Updates user role to 'CURATOR'
- **Important**: Already has logic to prevent duplicate profiles

### PATCH /api/curator/profile
**File**: `/app/api/curator/profile/route.ts` (lines 186-343)
- Updates curator profile fields
- Handles all settings (store info, social links, notifications, privacy)

### ❌ DELETE /api/curator/store - DOES NOT EXIST
**Needed**: New endpoint to handle store deletion

---

## 🚀 Implementation Requirements

### 1. Backend API Endpoint

**Create**: `/app/api/curator/store/delete/route.ts`

**Required Logic**:
```typescript
export async function DELETE(request: NextRequest) {
  // 1. Authenticate user
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return 401
  
  // 2. Find curator profile
  const curator = await prisma.curatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      orders: { select: { id: true } },
      collaborations1: { where: { status: 'ACTIVE' } },
      collaborations2: { where: { status: 'ACTIVE' } },
      products: { select: { id: true } }
    }
  })
  
  if (!curator) return 404
  
  // 3. ⚠️ CRITICAL: Check for blocking constraints
  if (curator.orders.length > 0) {
    return NextResponse.json({
      error: 'Cannot delete store with existing orders',
      orderCount: curator.orders.length,
      reason: 'orders_exist'
    }, { status: 409 })
  }
  
  const activeCollabs = [
    ...curator.collaborations1,
    ...curator.collaborations2
  ]
  if (activeCollabs.length > 0) {
    return NextResponse.json({
      error: 'Cannot delete store with active collaborations',
      collaborationCount: activeCollabs.length,
      reason: 'collaborations_active'
    }, { status: 409 })
  }
  
  // 4. Delete in transaction
  await prisma.$transaction(async (tx) => {
    // Delete curator profile (cascades to products, follows, etc.)
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
    message: 'Store deleted successfully'
  })
}
```

**Key Features**:
- ✅ Authenticates user session
- ✅ Checks for orders (prevents deletion if exist)
- ✅ Checks for active collaborations
- ✅ Uses transaction for atomicity
- ✅ Reverts user role to BUYER
- ✅ Returns detailed error messages

---

### 2. Frontend Updates

**File**: `/app/dashboard/curator/settings/page.tsx`

#### Changes Required:

**A. Update State (add after line 239)**
```tsx
const [storeDeletionInfo, setStoreDeletionInfo] = useState<{
  canDelete: boolean
  orderCount: number
  collaborationCount: number
  productCount: number
} | null>(null)
```

**B. Add Pre-check Function (add after line 556)**
```tsx
const checkStoreDeletion = async () => {
  try {
    const response = await fetch('/api/curator/store/check-deletion')
    const data = await response.json()
    setStoreDeletionInfo(data)
    
    if (data.canDelete) {
      setShowDeleteModal(true)
    } else {
      // Show blocking reasons
      alert(
        `Cannot delete store:\n` +
        `${data.orderCount > 0 ? `- ${data.orderCount} orders exist\n` : ''}` +
        `${data.collaborationCount > 0 ? `- ${data.collaborationCount} active collaborations\n` : ''}`
      )
    }
  } catch (error) {
    console.error('Error checking deletion:', error)
    alert('Failed to check deletion status')
  }
}
```

**C. Update Delete Function (replace lines 537-556)**
```tsx
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

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete store')
    }

    // Success - redirect to home
    alert('Store deleted successfully! Your account remains active.')
    window.location.href = '/'
  } catch (error) {
    console.error('Error deleting store:', error)
    alert(error instanceof Error ? error.message : 'Failed to delete store')
    setIsDeleting(false)
  }
}
```

**D. Update UI Text (lines 1469-1498)**
```tsx
{/* Danger Zone Tab */}
{activeTab === 'danger' && (
  <motion.div>
    <h2>Danger Zone</h2>
    
    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
      <div className="flex items-start space-x-4">
        <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Delete Store {/* ✅ UPDATED */}
          </h3>
          <p className="text-red-700 mb-4">
            This action cannot be undone. This will permanently delete your store,
            all products, and followers. Your user account will remain active
            and you can create a new store later.
          </p>
          
          {/* Show what will be deleted */}
          <div className="bg-white rounded-lg p-4 mb-4 text-sm">
            <p className="font-medium text-gray-900 mb-2">What will be deleted:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Store profile and branding</li>
              <li>All products ({storeDeletionInfo?.productCount || 0})</li>
              <li>Follower relationships</li>
              <li>Payment settings</li>
              <li>Collaboration requests</li>
            </ul>
            <p className="font-medium text-gray-900 mt-3 mb-2">What will be kept:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Your user account and email</li>
              <li>Ability to create a new store</li>
            </ul>
          </div>
          
          {/* Blocking warnings */}
          {storeDeletionInfo && !storeDeletionInfo.canDelete && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium mb-2">
                ⚠️ Cannot delete store:
              </p>
              <ul className="list-disc list-inside text-yellow-700 space-y-1">
                {storeDeletionInfo.orderCount > 0 && (
                  <li>You have {storeDeletionInfo.orderCount} order(s) - order history must be preserved</li>
                )}
                {storeDeletionInfo.collaborationCount > 0 && (
                  <li>You have {storeDeletionInfo.collaborationCount} active collaboration(s) - please end them first</li>
                )}
              </ul>
            </div>
          )}
          
          <button
            onClick={checkStoreDeletion}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete My Store</span> {/* ✅ UPDATED */}
          </button>
        </div>
      </div>
    </div>
  </motion.div>
)}
```

**E. Update Modal (lines 1524-1590)**
```tsx
{/* Delete Store Modal */}
<AnimatePresence>
  {showDeleteModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">
            Delete Store {/* ✅ UPDATED */}
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            This action is irreversible. All your store data and products will be
            permanently deleted. Your account will remain active.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700">
              To confirm deletion, please type <strong>DELETE</strong> in the field below:
            </p>
          </div>

          <input
            type="text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false)
              setDeleteConfirmation('')
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={deleteStore} {/* ✅ UPDATED function name */}
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
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

---

### 3. Optional: Check Endpoint

**Create**: `/app/api/curator/store/check-deletion/route.ts`

```typescript
export async function GET(request: NextRequest) {
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
          collaborations1: { where: { status: 'ACTIVE' } },
          collaborations2: { where: { status: 'ACTIVE' } }
        }
      }
    }
  })

  if (!curator) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const collaborationCount = 
    curator._count.collaborations1 + curator._count.collaborations2

  return NextResponse.json({
    canDelete: curator._count.orders === 0 && collaborationCount === 0,
    orderCount: curator._count.orders,
    collaborationCount: collaborationCount,
    productCount: curator._count.products
  })
}
```

---

## 🎨 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ Curator Settings Page - Danger Zone Tab            │
│ /dashboard/curator/settings?tab=danger              │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Curator clicks "Delete My Store"
                 ▼
┌─────────────────────────────────────────────────────┐
│ Pre-Check API Call                                  │
│ GET /api/curator/store/check-deletion               │
├─────────────────────────────────────────────────────┤
│ • Check order count                                 │
│ • Check active collaborations                       │
│ • Count products                                    │
└────────────┬───────────────────────┬────────────────┘
             │                       │
    Orders or │                       │ All clear
    Collabs   │                       │
    exist     ▼                       ▼
┌──────────────────────┐   ┌──────────────────────┐
│ Show Error Alert     │   │ Show Confirm Modal   │
│ - List blockers      │   │ - Type "DELETE"      │
│ - No deletion        │   │ - Confirm button     │
└──────────────────────┘   └──────────┬───────────┘
                                       │
                                       │ User confirms
                                       ▼
                      ┌─────────────────────────────────┐
                      │ DELETE /api/curator/store/delete│
                      ├─────────────────────────────────┤
                      │ Transaction:                    │
                      │ 1. Delete CuratorProfile        │
                      │    ├─ CASCADE: Products         │
                      │    ├─ CASCADE: Follows          │
                      │    ├─ CASCADE: CollabRequests   │
                      │    └─ CASCADE: PaymentSettings  │
                      │ 2. Update User role to BUYER    │
                      └──────────────┬──────────────────┘
                                     │
                                     │ Success
                                     ▼
                      ┌──────────────────────────────────┐
                      │ Redirect to Homepage             │
                      │ User can create new store later  │
                      └──────────────────────────────────┘
```

---

## ⚠️ Critical Decisions Required

### 1. Orders with Deleted Curators

**Problem**: Orders contain critical business data (payments, shipping addresses, commission records)

**Options**:

**A. Prevent Deletion (RECOMMENDED)**
- ✅ Preserves data integrity
- ✅ Maintains financial records
- ✅ Simple implementation
- ❌ Curator cannot delete if they have any orders

**B. Soft Delete Pattern**
- ✅ Curator appears deleted to users
- ✅ Data preserved for records
- ❌ More complex implementation
- ❌ Need `deletedAt` timestamp field
- ❌ Need to update all queries

**C. Transfer to System Account**
- Create "Deleted Curator" system account
- Transfer all orders to it
- ❌ Complex data migration
- ❌ Breaks referential integrity semantics

**Recommendation**: **Option A** - Prevent deletion if orders exist

---

### 2. Active Collaborations

**Problem**: Collaborations involve two curators

**Options**:

**A. Prevent Deletion (RECOMMENDED)**
- ✅ Forces proper collaboration closure
- ✅ Both curators must agree to end
- ❌ Curator must manually end collaborations first

**B. Auto-end Collaborations**
- Set status to 'ENDED' or 'CANCELLED'
- ✅ Cleaner for curator
- ❌ Affects other curator without consent

**Recommendation**: **Option A** - Require manual collaboration ending

---

### 3. Products in Buyer Carts

**Current Behavior**: CartItem has `onDelete: Cascade` on Product

**Result**: Products in carts will be automatically removed

**Decision**: ✅ **Acceptable** - Cart items are temporary, buyers are notified when items unavailable

---

### 4. Re-creation Policy

**Question**: Can curator immediately create a new store after deletion?

**Current Code**: POST `/api/curator/profile` only checks for existing profile
- After deletion, no profile exists
- ✅ Curator can immediately create new store

**Alternatives**:
- Add cooldown period (e.g., 30 days)
- Track deletion history
- Require admin approval for re-creation

**Recommendation**: ✅ **Allow immediate re-creation** - Gives curators flexibility

---

## 📁 File Structure

```
/app
  /api
    /curator
      /store
        /delete
          route.ts           ← NEW: DELETE endpoint
        /check-deletion
          route.ts           ← NEW: Pre-check endpoint
      /profile
        route.ts             ← EXISTING: GET, POST, PATCH
  /dashboard
    /curator
      /settings
        page.tsx             ← MODIFY: Update UI and API calls

/prisma
  schema.prisma              ← OPTIONAL: Add onDelete clauses
```

---

## ✅ Implementation Checklist

### Phase 1: Backend (Critical)
- [ ] Create `/app/api/curator/store/delete/route.ts`
  - [ ] Authentication check
  - [ ] Find curator profile
  - [ ] Check for orders (prevent deletion)
  - [ ] Check for active collaborations (prevent deletion)
  - [ ] Transaction: Delete profile + Update user role
  - [ ] Error handling and detailed responses
  
- [ ] Create `/app/api/curator/store/check-deletion/route.ts`
  - [ ] Return counts for orders, collaborations, products
  - [ ] Return `canDelete` boolean

### Phase 2: Frontend (Critical)
- [ ] Update `/app/dashboard/curator/settings/page.tsx`
  - [ ] Change text: "Delete Account" → "Delete Store"
  - [ ] Add `storeDeletionInfo` state
  - [ ] Create `checkStoreDeletion()` function
  - [ ] Update `deleteAccount()` → `deleteStore()` with API call
  - [ ] Add "What will be deleted" list in UI
  - [ ] Add blocking warnings for orders/collaborations
  - [ ] Update modal text and behavior

### Phase 3: Testing
- [ ] Test deletion with no orders/collaborations (should succeed)
- [ ] Test deletion with orders (should fail gracefully)
- [ ] Test deletion with collaborations (should fail gracefully)
- [ ] Test user role reverts to BUYER
- [ ] Test curator can create new store after deletion
- [ ] Test cascade deletes (products, follows, etc.)

### Phase 4: Optional Enhancements
- [ ] Add email notification on store deletion
- [ ] Add audit log for deletions
- [ ] Add "Download my data" before deletion
- [ ] Add soft delete pattern (if needed later)

---

## 🧪 Test Scenarios

### Test 1: Clean Deletion
**Setup**: Curator with products, followers, no orders
**Expected**: 
- ✅ Store deleted successfully
- ✅ Products CASCADE deleted
- ✅ Follows CASCADE deleted
- ✅ User role = BUYER
- ✅ Can create new store

### Test 2: Blocked by Orders
**Setup**: Curator with 1+ orders
**Expected**:
- ❌ Deletion blocked
- ❌ Error: "Cannot delete store with existing orders"
- ✅ Store remains intact

### Test 3: Blocked by Collaborations
**Setup**: Curator with active collaboration
**Expected**:
- ❌ Deletion blocked
- ❌ Error: "Cannot delete store with active collaborations"
- ✅ Store remains intact

### Test 4: Re-creation
**Setup**: After successful deletion
**Expected**:
- ✅ POST `/api/curator/profile` succeeds
- ✅ New store created with new slug
- ✅ User role back to CURATOR

---

## 📝 Migration Notes

If you decide to add explicit onDelete clauses to the schema:

```prisma
// /prisma/schema.prisma

model Order {
  // Add onDelete: Restrict to make constraint explicit
  curator CuratorProfile @relation("CuratorOrders", fields: [curatorId], references: [id], onDelete: Restrict)
}

model Collaboration {
  curator1 CuratorProfile @relation("CuratorCollaborations1", fields: [curator1Id], references: [id], onDelete: Restrict)
  curator2 CuratorProfile @relation("CuratorCollaborations2", fields: [curator2Id], references: [id], onDelete: Restrict)
}
```

**Then run**:
```bash
npx prisma migrate dev --name add-explicit-delete-constraints
```

**Note**: This is **optional** - PostgreSQL default behavior already prevents deletion, this just makes it explicit in the schema.

---

## 🎓 Summary

### What Exists Now
- ✅ Database schema with CuratorProfile
- ✅ UI for "Danger Zone" in settings
- ✅ Modal with confirmation input
- ❌ **NO** actual deletion logic
- ❌ **MISLEADING** text (says "account" not "store")

### What You Need to Build
1. **Backend API** - `/api/curator/store/delete` route
2. **Frontend Logic** - Update settings page with real API calls
3. **Validation** - Check for orders and collaborations
4. **UI Updates** - Clear messaging about store vs account

### Key Design Decisions
- ✅ Delete STORE, keep account
- ✅ Prevent deletion if orders exist (data integrity)
- ✅ Prevent deletion if active collaborations exist
- ✅ Allow immediate store re-creation
- ✅ Cascade delete products, follows, settings

### Estimated Effort
- Backend API: ~2-3 hours
- Frontend updates: ~2-3 hours
- Testing: ~2 hours
- **Total**: ~6-8 hours

---

## 📚 References

- **Danger Zone UI**: `/app/dashboard/curator/settings/page.tsx:1469-1590`
- **Delete Function**: `/app/dashboard/curator/settings/page.tsx:537-556`
- **Profile API**: `/app/api/curator/profile/route.ts`
- **Schema**: `/prisma/schema.prisma:75-118` (CuratorProfile)
- **Orders**: `/prisma/schema.prisma:159-180`
- **Collaborations**: `/prisma/schema.prisma:240-257`

---

*Generated: 2024*
*Status: Ready for Implementation*
