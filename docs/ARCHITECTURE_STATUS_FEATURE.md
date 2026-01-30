# 📊 Publication Status Feature - Architecture Diagram

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    1. CURATOR DASHBOARD VIEW                      │
│  /app/dashboard/curator/products/page.tsx                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Product Card                                             │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │  [Product Image]                                 │     │   │
│  │  │                            [Active Badge] [⋮]    │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                                                           │   │
│  │  Click [⋮] → Dropdown Opens:                             │   │
│  │    ┌─────────────────────────┐                           │   │
│  │    │ 👁️  View                │                           │   │
│  │    │ ✏️  Edit                │                           │   │
│  │    │ ❌ Mark Inactive ←───── Click triggers API         │   │
│  │    │ 🗑️  Delete              │                           │   │
│  │    └─────────────────────────┘                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ PATCH /api/curator/products/{id}/status
                              │ { isActive: false }
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    2. API ENDPOINT (NEW)                          │
│  /app/api/curator/products/[id]/status/route.ts                 │
│                                                                   │
│  1. Authenticate user                                            │
│  2. Verify user is CURATOR                                       │
│  3. Get curator profile                                          │
│  4. Verify product ownership ← IMPORTANT!                        │
│  5. Update product.isActive in database                          │
│  6. Return success response                                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Updates Database
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    3. DATABASE                                    │
│  PostgreSQL via Prisma                                           │
│                                                                   │
│  products table                                                  │
│  ┌────────────────────────────────────────────┐                 │
│  │ id      title         price    isActive    │                 │
│  │ abc123  "Blue Dress"  $89.99   false ←──── Updated          │
│  └────────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Changes propagate to...
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    4. PUBLIC VIEWS                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ A. Curator Store Page                                     │   │
│  │    /app/curator/[curatorSlug]/page.tsx                   │   │
│  │                                                           │   │
│  │    Query: SELECT * FROM products                         │   │
│  │           WHERE curatorId = X                            │   │
│  │           AND isActive = true ← Filter here              │   │
│  │                                                           │   │
│  │    Result: "Blue Dress" NOT shown in product grid        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ B. Direct Product Page                                    │   │
│  │    /app/curator/[curatorSlug]/product/[productSlug]      │   │
│  │                                                           │   │
│  │    Query: SELECT * FROM products WHERE slug = "blue-dress"│   │
│  │                                                           │   │
│  │    Check: if (!product.isActive) {                        │   │
│  │      return <ProductUnavailable reason="inactive" />      │   │
│  │    }                                                      │   │
│  │                                                           │   │
│  │    Result: Shows "Esta pieza ha sido vendida" message    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
app/dashboard/curator/products/page.tsx
│
├── Product Grid
│   └── Product Card (repeat for each product)
│       ├── Product Image
│       ├── Status Badge (Active/Inactive)
│       ├── Product Info
│       ├── Action Buttons
│       └── ProductDropdownMenu ← NEW COMPONENT
│           ├── View Link
│           ├── Edit Link
│           ├── Toggle Status Button ← NEW
│           └── Delete Button
│
└── Filters
    ├── Search Input
    ├── Status Filter (All/Active/Inactive) ← Already exists
    └── Sort Dropdown
```

---

## Data Flow Sequence

```
User Action                API Call                    Database Update              UI Update
─────────────────────────────────────────────────────────────────────────────────────────────

1. Click "Mark Inactive"
                           │
                           ▼
2.                    PATCH /api/curator/
                      products/abc123/status
                      Body: { isActive: false }
                           │
                           ▼
3.                    Authenticate & Authorize
                      - Check user is logged in
                      - Check user is CURATOR
                      - Check curator owns product
                           │
                           ▼
4.                                              UPDATE products
                                                SET isActive = false
                                                WHERE id = 'abc123'
                           │
                           ▼
5.                    Return: { 
                        success: true,
                        product: { isActive: false }
                      }
                           │
                           ▼
6.                                                                               Update local state
                                                                                 Badge: Active → Inactive
                                                                                 Re-render card

7. (Simultaneously)                            SELECT * FROM products            Curator page
                                               WHERE isActive = true             no longer shows
                                               -- "Blue Dress" excluded          "Blue Dress"

8. (If user visits                             SELECT * FROM products            Shows
   /product/blue-dress)                        WHERE slug = 'blue-dress'         ProductUnavailable
                                               -- Returns isActive = false       component
```

---

## File Dependencies

```
FRONTEND COMPONENTS
├── app/dashboard/curator/products/page.tsx (UPDATE)
│   └── imports ProductDropdownMenu
│
├── components/curator/ProductDropdownMenu.tsx (CREATE NEW)
│   └── uses lucide-react icons
│
└── components/product/ProductUnavailable.tsx (ALREADY EXISTS)
    └── uses translations from locales/

API LAYER
├── app/api/curator/products/[id]/status/route.ts (CREATE NEW)
│   ├── imports getApiUser from @/lib/api-auth
│   ├── imports requireApiRole from @/lib/api-auth
│   ├── imports PrismaClient from @prisma/client
│   └── validates ownership before update
│
└── app/api/products/[slug]/route.ts (ALREADY EXISTS)
    └── already filters isActive

DATABASE
└── prisma/schema.prisma
    └── Product.isActive field (ALREADY EXISTS)

TRANSLATIONS
├── locales/en/common.json (ALREADY EXISTS)
│   └── product.unavailable.sold.*
│
└── locales/es/common.json (ALREADY EXISTS)
    └── product.unavailable.sold.*
```

---

## Security Model

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION FLOW                         │
└──────────────────────────────────────────────────────────────┘

Request: PATCH /api/curator/products/abc123/status
Headers: Cookie with session token

1. Extract user from session
   ├─ If no session → Return 401 Unauthorized
   └─ If session valid → Continue

2. Check user role
   ├─ If role !== 'CURATOR' → Return 403 Forbidden
   └─ If role === 'CURATOR' → Continue

3. Get curator profile from user.id
   ├─ If no profile → Return 404 Not Found
   └─ If profile exists → Continue

4. Get product by ID
   ├─ If product not found → Return 404 Not Found
   └─ If product exists → Continue

5. Verify ownership
   ├─ If product.curatorId !== curatorProfile.id → Return 403 Forbidden
   └─ If ownership valid → Continue

6. Update product.isActive
   └─ Return 200 Success

This ensures:
✓ Only authenticated users can access
✓ Only curators can change status
✓ Curators can only change their own products
✓ No cross-curator modification possible
```

---

## State Management Pattern

```
┌────────────────────────────────────────────────────────────┐
│           OPTIMISTIC VS PESSIMISTIC UPDATE                  │
└────────────────────────────────────────────────────────────┘

CURRENT IMPLEMENTATION (Pessimistic):
────────────────────────────────────────────────────────────
1. User clicks "Mark Inactive"
2. Show loading spinner
3. Call API
4. Wait for response
5. If success → Update UI
6. If error → Show error message

OPTIONAL ENHANCEMENT (Optimistic):
────────────────────────────────────────────────────────────
1. User clicks "Mark Inactive"
2. Immediately update UI (badge changes)
3. Call API in background
4. If success → Keep UI as is
5. If error → Revert UI + Show error

Benefits:
✓ Feels faster
✓ Better UX
✗ More complex error handling
```

---

## Testing Strategy

```
UNIT TESTS
├── API Endpoint
│   ├── Returns 401 if not authenticated
│   ├── Returns 403 if not curator
│   ├── Returns 403 if not product owner
│   ├── Returns 404 if product doesn't exist
│   ├── Returns 400 if isActive is not boolean
│   └── Returns 200 and updates database if valid
│
└── Dropdown Component
    ├── Opens on click
    ├── Closes on outside click
    ├── Shows correct label based on isActive
    ├── Disables during loading
    └── Calls onStatusChange with correct params

INTEGRATION TESTS
├── Toggle status in dashboard
│   └── Verify badge updates
│
├── Check public curator page
│   └── Verify product hidden/shown
│
└── Visit inactive product URL
    └── Verify ProductUnavailable shown

E2E TESTS
└── Full user flow
    ├── Login as curator
    ├── Go to products page
    ├── Toggle product to inactive
    ├── Visit public store
    ├── Verify product not shown
    ├── Visit product URL directly
    ├── Verify "sold" message shown
    ├── Return to dashboard
    └── Toggle back to active
```

---

## Performance Considerations

```
DATABASE QUERIES
────────────────────────────────────────────────────────────
Current query in curator page:
  SELECT * FROM products 
  WHERE curatorId = ? AND isActive = true
  
Index recommendations:
  ✓ Already indexed: curatorId (foreign key)
  ✓ Already indexed: isActive (boolean field)
  ✓ Composite index not needed (small result set)

CACHING
────────────────────────────────────────────────────────────
Current: force-dynamic, revalidate = 0
  → No caching, always fresh data
  → Good for consistency
  → Fine for MVP

Future optimization:
  → Revalidate on status change
  → Use incremental static regeneration
  → Cache public curator pages

REAL-TIME UPDATES
────────────────────────────────────────────────────────────
Current: Manual refresh required
  → User must reload page to see changes
  → Acceptable for MVP

Future enhancement:
  → Use Server-Sent Events (SSE)
  → Use WebSockets
  → Use React Query for auto-refetch
```

---

## Rollback Plan

```
IF SOMETHING GOES WRONG:
────────────────────────────────────────────────────────────

1. API Endpoint has bugs
   → Delete the new route file
   → Feature won't work, but won't break anything

2. Dropdown Component has bugs
   → Remove import from products page
   → Revert to old three-dot button
   → No functionality, but UI still works

3. Database issues (unlikely - field exists)
   → No migration was done
   → No rollback needed

4. Public pages show wrong data
   → Check query filters
   → isActive filter already exists and works
   → Issue would be elsewhere

BACKUP BEFORE DEPLOYING:
────────────────────────────────────────────────────────────
✓ Git commit current working state
✓ Tag release before deployment
✓ Test in staging environment first
✓ Deploy during low-traffic period
✓ Monitor error logs after deployment
```

---

This diagram provides a complete architectural overview of the feature!
