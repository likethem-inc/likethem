# 🗺️ Store Deletion - Implementation Roadmap

## Quick Overview

**Goal**: Allow curators to delete their STORE (not account) from the Danger Zone section. After deletion, the curator account remains active and they can create a new store.

**Current Status**: ❌ Not implemented (only UI exists)
**Estimated Time**: 45-60 minutes
**Complexity**: Medium (database constraints require careful handling)

---

## 🎯 Implementation Plan

### Phase 1: Backend API (30 minutes) ⚡ HIGH PRIORITY

#### Step 1.1: Create Delete Endpoint (15 min)
**File**: `/app/api/curator/store/delete/route.ts` (NEW FILE)

**Purpose**: Actually delete the curator store
**Key Logic**:
- ✅ Authenticate session
- ✅ Find curator profile
- ✅ Check for orders (block if exist)
- ✅ Check for active collaborations (block if exist)
- ✅ Delete in transaction (profile + update user role)

**Code Reference**: See `STORE_DELETION_QUICK_START.md` lines 7-107

---

#### Step 1.2: Create Check Endpoint (15 min)
**File**: `/app/api/curator/store/check-deletion/route.ts` (NEW FILE)

**Purpose**: Pre-check if deletion is allowed
**Key Logic**:
- ✅ Count orders
- ✅ Count active collaborations
- ✅ Count products/followers (for display)
- ✅ Return `canDelete` boolean + counts

**Code Reference**: See `STORE_DELETION_QUICK_START.md` lines 111-169

---

### Phase 2: Frontend Updates (20 minutes) ⚡ HIGH PRIORITY

#### Step 2.1: Add State Variables (2 min)
**File**: `/app/dashboard/curator/settings/page.tsx`
**Location**: After line 239

Add `deletionInfo` state to track what will be deleted and blockers.

**Code Reference**: See `STORE_DELETION_QUICK_START.md` lines 173-187

---

#### Step 2.2: Replace Delete Function (5 min)
**File**: `/app/dashboard/curator/settings/page.tsx`
**Location**: Replace lines 537-556

Replace `deleteAccount()` with two functions:
1. `checkStoreDeletion()` - Pre-check and show modal or error
2. `deleteStore()` - Actually delete via API

**Code Reference**: See `STORE_DELETION_QUICK_START.md` lines 191-251

---

#### Step 2.3: Update UI Text (8 min)
**File**: `/app/dashboard/curator/settings/page.tsx`
**Location**: Replace lines 1476-1498

Changes:
- ❌ "Delete Account" → ✅ "Delete Store"
- Add "What will be deleted" list
- Add "What will be kept" list
- Show warning box if blockers exist
- Display counts (products, followers, etc.)

**Code Reference**: See `STORE_DELETION_QUICK_START.md` lines 255-330

---

#### Step 2.4: Update Modal (5 min)
**File**: `/app/dashboard/curator/settings/page.tsx`
**Location**: Lines 1536 & 1540 & 1570

Changes:
- Update title: "Delete Account" → "Delete Store"
- Update description to clarify account remains active
- Change function call: `deleteAccount` → `deleteStore`

**Code Reference**: See `STORE_DELETION_QUICK_START.md` lines 334-368

---

### Phase 3: Testing (15 minutes) 🧪

#### Test 1: Clean Deletion (No Orders)
```
✅ Curator with products but no orders
✅ Should successfully delete
✅ Products cascade delete
✅ User role reverts to BUYER
✅ Can create new store
```

#### Test 2: Blocked by Orders
```
❌ Curator with 1+ orders
❌ Deletion should be blocked
⚠️  Show yellow warning box with order count
```

#### Test 3: Blocked by Collaborations
```
❌ Curator with active collaboration
❌ Deletion should be blocked
⚠️  Show yellow warning box with collab count
```

#### Test 4: Re-creation Flow
```
✅ After successful deletion
✅ User can apply to be curator again
✅ Can create new store with new slug
```

**Full Test Cases**: See `STORE_DELETION_QUICK_START.md` lines 372-423

---

## 🗂️ File Structure

```
likethem/
├── app/
│   ├── api/
│   │   └── curator/
│   │       ├── profile/
│   │       │   └── route.ts                    ← EXISTING (GET, POST, PATCH)
│   │       └── store/
│   │           ├── delete/
│   │           │   └── route.ts                ← CREATE THIS ⚡
│   │           └── check-deletion/
│   │               └── route.ts                ← CREATE THIS ⚡
│   └── dashboard/
│       └── curator/
│           └── settings/
│               └── page.tsx                    ← MODIFY THIS ⚡
├── prisma/
│   └── schema.prisma                           ← REFERENCE (no changes needed)
├── STORE_DELETION_ANALYSIS.md                  ← READ THIS FIRST 📖
├── STORE_DELETION_QUICK_START.md               ← CODE HERE 💻
└── STORE_DELETION_ROADMAP.md                   ← YOU ARE HERE 🗺️
```

---

## 📊 What Gets Deleted (Visual)

```
┌─────────────────────────────────────────────────────────────┐
│  CuratorProfile (DELETED)                                   │
│  ├── storeName                                              │
│  ├── slug                                                   │
│  ├── bio                                                    │
│  ├── avatarImage                                            │
│  └── bannerImage                                            │
└─────────────────────────────────────────────────────────────┘
         │
         ├─> Products (CASCADE DELETE)
         │   ├─> ProductImages (CASCADE)
         │   ├─> CartItems (CASCADE) ⚠️ Buyers lose items
         │   ├─> Favorites (CASCADE)
         │   └─> WishlistItems (CASCADE)
         │
         ├─> Follow (CASCADE DELETE)
         │   └─> All follower relationships removed
         │
         ├─> CollaborationRequest (CASCADE DELETE)
         │   └─> All pending requests removed
         │
         └─> PaymentSettings (CASCADE DELETE)
             └─> Yape/Plin/Stripe settings removed

┌─────────────────────────────────────────────────────────────┐
│  BLOCKED FROM DELETION (Causes 409 Error)                   │
├─────────────────────────────────────────────────────────────┤
│  ⛔ Orders (RESTRICT)                                        │
│     - Contains payment records                              │
│     - Contains shipping info                                │
│     - Contains commission data                              │
│     → SOLUTION: Prevent deletion if orders exist            │
│                                                              │
│  ⛔ Collaborations (RESTRICT)                                │
│     - Involves another curator                              │
│     - May have joint products/pages                         │
│     → SOLUTION: Require manual collaboration end            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  User (UPDATED, NOT DELETED)                                │
│  ├── role: 'CURATOR' → 'BUYER'    ✅                        │
│  ├── email: UNCHANGED              ✅                        │
│  ├── name: UNCHANGED               ✅                        │
│  └── id: UNCHANGED                 ✅                        │
└─────────────────────────────────────────────────────────────┘
         │
         └─> Can create new CuratorProfile later! ✅
```

---

## 🚦 Decision Tree

```
User clicks "Delete My Store"
         │
         ▼
┌────────────────────┐
│ Call Check API     │
│ GET /check-deletion│
└─────────┬──────────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
Has Orders?   Has Active Collabs?
    │               │
   Yes             Yes
    │               │
    ▼               ▼
┌─────────────────────────┐
│ BLOCK DELETION          │
│ Show yellow warning box │
│ Display reason & count  │
│ No modal shown          │
└─────────────────────────┘

    No to both
         │
         ▼
┌─────────────────────────┐
│ ALLOW DELETION          │
│ Show confirmation modal │
│ Display "what deleted"  │
│ Require typing "DELETE" │
└──────────┬──────────────┘
           │
           │ User confirms
           ▼
┌────────────────────┐
│ Call Delete API    │
│ DELETE /store/delete│
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────────┐
│ Transaction:                   │
│ 1. Delete CuratorProfile       │
│ 2. Update User.role → BUYER    │
└──────────┬─────────────────────┘
           │
           ▼
┌─────────────────────────┐
│ Success!                │
│ Redirect to homepage    │
│ Can create new store    │
└─────────────────────────┘
```

---

## 🔑 Key Code Snippets

### API Error Responses

**Orders Exist (409)**:
```json
{
  "error": "Cannot delete store with existing orders",
  "reason": "orders_exist",
  "orderCount": 5,
  "message": "Your store has order history that must be preserved..."
}
```

**Collaborations Exist (409)**:
```json
{
  "error": "Cannot delete store with active collaborations",
  "reason": "collaborations_active",
  "collaborationCount": 2,
  "message": "Please end all active collaborations before deleting..."
}
```

**Success (200)**:
```json
{
  "success": true,
  "message": "Store deleted successfully. Your account remains active..."
}
```

---

### Database Transaction

```typescript
await prisma.$transaction(async (tx) => {
  // Step 1: Delete curator profile
  // (This cascades to products, follows, payment settings, etc.)
  await tx.curatorProfile.delete({
    where: { id: curator.id }
  })

  // Step 2: Revert user role
  await tx.user.update({
    where: { id: session.user.id },
    data: { role: 'BUYER' }
  })
})
```

**Why Transaction?**
- ✅ Atomic: Both operations succeed or both fail
- ✅ No orphaned data
- ✅ Rollback on error

---

### Frontend State Flow

```typescript
// Initial state
deletionInfo = null

// User clicks "Delete My Store"
checkStoreDeletion()
  ↓
// Fetch deletion info
GET /api/curator/store/check-deletion
  ↓
// Store result
deletionInfo = {
  canDelete: boolean,
  orderCount: number,
  collaborationCount: number,
  productCount: number,
  followerCount: number
}
  ↓
// Decision
if (canDelete) {
  showDeleteModal = true  // Show confirmation
} else {
  alert('Cannot delete...')  // Show blocker reasons
}

// User confirms in modal
deleteStore()
  ↓
// Delete via API
DELETE /api/curator/store/delete
  ↓
// Success
window.location.href = '/'
```

---

## 🎯 Critical Considerations

### 1. Order History Preservation
**Why it matters**: 
- Legal requirement for financial records
- Buyers need order history
- Commission tracking for platform

**Solution**: Prevent deletion if orders exist

---

### 2. Collaboration Integrity
**Why it matters**:
- Involves another curator
- May have shared products/pages
- Both curators should consent to changes

**Solution**: Require manual collaboration ending first

---

### 3. Products in Buyer Carts
**Why it matters**:
- Buyers may have items in cart
- Cart items reference product IDs

**Current Behavior**: CASCADE delete (acceptable)
**Rationale**: Carts are temporary, buyers see "unavailable" if needed

---

### 4. Immediate Re-creation
**Current Behavior**: Allowed immediately after deletion

**Why**:
- No technical blocker (profile deleted, can create new)
- Gives curators flexibility
- Different store name/slug required

**Alternative** (not implemented): Add cooldown period

---

## 📋 Pre-flight Checklist

Before implementation:

- [ ] Read `STORE_DELETION_ANALYSIS.md` (comprehensive details)
- [ ] Read `STORE_DELETION_QUICK_START.md` (code snippets)
- [ ] Understand database cascade behavior
- [ ] Understand order/collaboration constraints
- [ ] Have test data ready (curator with/without orders)

---

## 🚀 Implementation Order

**Recommended sequence**:

1. **Backend First** (safer)
   - [ ] Create `/api/curator/store/check-deletion/route.ts`
   - [ ] Create `/api/curator/store/delete/route.ts`
   - [ ] Test endpoints with Postman/curl

2. **Frontend Second**
   - [ ] Update state variables
   - [ ] Update functions
   - [ ] Update UI text
   - [ ] Update modal

3. **Integration Testing**
   - [ ] Test clean deletion
   - [ ] Test blocked by orders
   - [ ] Test blocked by collaborations
   - [ ] Test re-creation flow

---

## 🆘 Common Pitfalls

### Pitfall 1: Forgetting Transaction
❌ **Wrong**:
```typescript
await prisma.curatorProfile.delete({ where: { id } })
await prisma.user.update({ where: { id }, data: { role: 'BUYER' } })
```
If second call fails, curator profile is deleted but user still CURATOR role!

✅ **Right**:
```typescript
await prisma.$transaction(async (tx) => {
  await tx.curatorProfile.delete({ where: { id } })
  await tx.user.update({ where: { id }, data: { role: 'BUYER' } })
})
```

---

### Pitfall 2: Not Checking Orders
❌ **Wrong**:
```typescript
// Just delete without checking
await prisma.curatorProfile.delete({ where: { id } })
```
💥 Foreign key constraint error if orders exist!

✅ **Right**:
```typescript
const orderCount = await prisma.order.count({ where: { curatorId } })
if (orderCount > 0) {
  return NextResponse.json({ error: '...' }, { status: 409 })
}
```

---

### Pitfall 3: Deleting User Account
❌ **Wrong**: Deleting the User model
✅ **Right**: Only delete CuratorProfile, keep User

Remember: **Store deletion ≠ Account deletion**

---

## 📞 Support & References

**Documentation**:
- Main Analysis: `STORE_DELETION_ANALYSIS.md`
- Code Guide: `STORE_DELETION_QUICK_START.md`
- This File: `STORE_DELETION_ROADMAP.md`

**Database Schema**:
- CuratorProfile: `prisma/schema.prisma:75-118`
- Order: `prisma/schema.prisma:159-180`
- Collaboration: `prisma/schema.prisma:240-257`

**Existing APIs**:
- Profile API: `/app/api/curator/profile/route.ts`
- Apply API: `/app/api/curator/apply/route.ts`

**Frontend**:
- Settings: `/app/dashboard/curator/settings/page.tsx:1469-1590`

---

## ✅ Done Checklist

After implementation:

- [ ] Both API endpoints created and tested
- [ ] Frontend updated with new functions
- [ ] All UI text updated (Account → Store)
- [ ] Warning boxes show correct counts
- [ ] Modal shows correct messaging
- [ ] Tested clean deletion (no orders)
- [ ] Tested blocked deletion (with orders)
- [ ] Tested blocked deletion (with collaborations)
- [ ] Tested re-creation flow
- [ ] Tested user role reverts to BUYER
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Smoke tested in production

---

**Status**: Ready for Implementation 🚀
**Estimated Total Time**: 45-60 minutes
**Risk Level**: Medium (database constraints require care)
**Impact**: High (critical feature for curator management)

---

*Last Updated: 2024*
*Version: 1.0*
