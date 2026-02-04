# Inventory Management System - Visual Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         LIKETHEM PLATFORM                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Curator Dashboard - Inventory Page            │   │
│  │                /dashboard/curator/inventory             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  ┌──────────────────┐     ┌────────────────────────┐   │   │
│  │  │  InventoryList   │     │  CSVImportExport       │   │   │
│  │  ├──────────────────┤     ├────────────────────────┤   │   │
│  │  │ • View variants  │     │ • Download CSV         │   │   │
│  │  │ • Edit stock     │     │ • Upload CSV           │   │   │
│  │  │ • Search/filter  │     │ • Download template    │   │   │
│  │  │ • Visual status  │     │ • Validation errors    │   │   │
│  │  └──────────────────┘     └────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Product Detail Page (Buyers)               │   │
│  │                                                           │   │
│  │  • Fetch variants availability                           │   │
│  │  • Show stock status per size/color                      │   │
│  │  • Disable out-of-stock variants                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                            API LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │             Curator Inventory APIs (Protected)          │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  GET    /api/curator/inventory                           │   │
│  │         → List all variants for curator                  │   │
│  │                                                           │   │
│  │  POST   /api/curator/inventory                           │   │
│  │         → Create/update multiple variants                │   │
│  │                                                           │   │
│  │  PUT    /api/curator/inventory/[id]                      │   │
│  │         → Update single variant                          │   │
│  │                                                           │   │
│  │  DELETE /api/curator/inventory/[id]                      │   │
│  │         → Delete variant                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 CSV Import/Export APIs                   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  GET    /api/curator/inventory/csv                       │   │
│  │         → Download inventory as CSV                      │   │
│  │                                                           │   │
│  │  POST   /api/curator/inventory/csv                       │   │
│  │         → Upload CSV to update inventory                 │   │
│  │                                                           │   │
│  │  GET    /api/curator/inventory/csv/template              │   │
│  │         → Download CSV template                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               Public Product APIs                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  GET    /api/products/[slug]/variants                    │   │
│  │         → Get all variants for a product                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Order Creation API (Updated)             │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  POST   /api/orders                                      │   │
│  │         → Validate size/color selection                  │   │
│  │         → Check variant stock availability               │   │
│  │         → Reduce variant stock on payment                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BUSINESS LOGIC LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Inventory Utility Functions                      │   │
│  │         /lib/inventory/variants.ts                       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                           │   │
│  │  • checkVariantAvailability()                            │   │
│  │  • getProductVariants()                                  │   │
│  │  • updateVariantStock()                                  │   │
│  │  • upsertVariant()                                       │   │
│  │  • initializeProductVariants()                           │   │
│  │  • getProductTotalStock()                                │   │
│  │  • isProductInStock()                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Products Table                        │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ id, title, description, price, category, ...   │     │   │
│  │  │ sizes (comma-separated)                         │     │   │
│  │  │ colors (comma-separated)                        │     │   │
│  │  │ stockQuantity (deprecated - use variants)       │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              │ 1:N relationship                   │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ProductVariants Table (NEW!)                │   │
│  │  ┌────────────────────────────────────────────────┐     │   │
│  │  │ id, productId, size, color, stockQuantity      │     │   │
│  │  │ sku (optional), createdAt, updatedAt           │     │   │
│  │  │                                                 │     │   │
│  │  │ UNIQUE: (productId, size, color)               │     │   │
│  │  │ FOREIGN KEY: productId → products.id           │     │   │
│  │  │ ON DELETE: CASCADE                              │     │   │
│  │  └────────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Order Flow with Variant Inventory

```
┌──────────────────────────────────────────────────────────────────┐
│                      CHECKOUT PROCESS                             │
└──────────────────────────────────────────────────────────────────┘

1. CART
   ┌────────────────────┐
   │ User adds product  │
   │ Selects size       │──────► No stock check yet
   │ Selects color      │        (prevents overselling)
   └────────────────────┘

2. CHECKOUT
   ┌────────────────────┐
   │ User proceeds to   │
   │ checkout           │
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ Validate variants  │──────► Check if variant exists
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ Check stock        │──────► Check variant.stockQuantity
   │ availability       │        >= requestedQuantity
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ Show error if      │
   │ insufficient stock │◄────── Prevent order creation
   └────────────────────┘

3. PAYMENT
   ┌────────────────────┐
   │ Payment confirmed  │
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ BEGIN TRANSACTION  │
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ Create order       │
   │ Create order items │
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ Reduce variant     │──────► UPDATE product_variants
   │ stock              │        SET stockQuantity = 
   └────────────────────┘            stockQuantity - quantity
            │                     WHERE productId = ?
            ▼                       AND size = ?
   ┌────────────────────┐           AND color = ?
   │ COMMIT TRANSACTION │
   └────────────────────┘
            │
            ▼
   ┌────────────────────┐
   │ Order complete!    │
   └────────────────────┘
```

## 📊 Data Flow: CSV Import

```
┌──────────────────────────────────────────────────────────────────┐
│                       CSV IMPORT PROCESS                          │
└──────────────────────────────────────────────────────────────────┘

1. USER UPLOADS CSV
   ┌───────────────────┐
   │ Select CSV file   │
   │ from computer     │
   └───────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ Parse CSV content │
   └───────────────────┘

2. VALIDATION
           │
           ▼
   ┌───────────────────┐
   │ Check format      │──────► Header: productSlug,size,color,stock,sku
   └───────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ Validate each row │
   ├───────────────────┤
   │ • Required fields │──────► productSlug, size, color, stock
   │ • Stock ≥ 0       │
   │ • Product exists  │
   │ • Curator owns it │
   └───────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ Show errors if    │
   │ validation fails  │◄────── List all errors
   └───────────────────┘        User can fix and retry

3. PROCESSING
           │
           ▼
   ┌───────────────────┐
   │ BEGIN TRANSACTION │
   └───────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ For each variant: │
   ├───────────────────┤
   │ UPSERT            │──────► If exists: UPDATE
   │ product_variants  │        If not: INSERT
   └───────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ COMMIT            │
   └───────────────────┘
           │
           ▼
   ┌───────────────────┐
   │ Show summary      │
   ├───────────────────┤
   │ • Created: X      │
   │ • Updated: Y      │
   │ • Total: X + Y    │
   └───────────────────┘
```

## 🎨 Stock Status Visual Indicators

```
┌──────────────────────────────────────────────────────────────────┐
│                    INVENTORY LIST UI                              │
└──────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════╗
║ Product         │ Size │ Color │ SKU     │ Stock │ Actions     ║
╠════════════════════════════════════════════════════════════════╣
║ Blue Jeans      │  M   │ Blue  │ JNS-001 │  [0]  │ Edit        ║
║                 │      │       │         │  🔴   │             ║  ← Out of Stock
╠────────────────────────────────────────────────────────────────╣
║ Red T-Shirt     │  L   │ Red   │ TSH-002 │  [3]  │ Edit        ║
║                 │      │       │         │  🟡   │             ║  ← Low Stock (< 5)
╠────────────────────────────────────────────────────────────────╣
║ Black Hoodie    │  XL  │ Black │ HOD-003 │ [25]  │ Edit        ║
║                 │      │       │         │  ⚪   │             ║  ← In Stock
╚════════════════════════════════════════════════════════════════╝

Legend:
  🔴 Red border    = Out of stock (0)
  🟡 Yellow border = Low stock (< 5)
  ⚪ White border  = In stock (≥ 5)
```

## 🔐 Security & Authorization

```
┌──────────────────────────────────────────────────────────────────┐
│                      SECURITY MODEL                               │
└──────────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS
  GET /api/products/[slug]/variants
      │
      └──► Anyone can view variant availability
           Used by product detail pages

PROTECTED ENDPOINTS (Curator only)
  ALL /api/curator/inventory/*
      │
      ├──► 1. Check authentication
      │        getCurrentUser() or getApiUser()
      │
      ├──► 2. Check role = 'CURATOR'
      │        requireApiRole(user, 'CURATOR')
      │
      ├──► 3. Get curator profile
      │        prisma.curatorProfile.findUnique(userId)
      │
      └──► 4. Verify ownership
           • Product belongs to curator
           • Variant's product belongs to curator
           
           If any check fails → 401/403 error
```

## 📈 Performance Optimizations

```
DATABASE INDEXES
  ┌─────────────────────────────────────────┐
  │ product_variants                         │
  ├─────────────────────────────────────────┤
  │ PRIMARY KEY: id                          │
  │ UNIQUE INDEX: (productId, size, color) │ ← Fast lookups
  │ UNIQUE INDEX: sku                       │ ← Optional SKU search
  │ FOREIGN KEY: productId → products(id)   │ ← Fast joins
  └─────────────────────────────────────────┘

QUERY PATTERNS
  • List variants: WHERE productId IN (curator's products)
  • Check availability: WHERE productId = ? AND size = ? AND color = ?
  • Update stock: WHERE id = ? (indexed by PK)
  • Cascade delete: ON DELETE CASCADE (automatic)

TRANSACTIONS
  • Stock updates use BEGIN/COMMIT
  • Prevents race conditions
  • Atomic operations
```

---

## 🎯 Key Takeaways

1. **Variant-Based**: Inventory tracked per size/color combination
2. **Stock on Payment**: Stock reduced only when order is paid
3. **Bulk Operations**: CSV import/export for efficiency
4. **Real-Time UI**: Inline editing with immediate feedback
5. **Data Integrity**: Unique constraints, transactions, validation
6. **Secure**: Role-based access control, ownership verification
7. **Scalable**: Efficient indexes, optimized queries
8. **Maintainable**: Clean architecture, utility functions, documentation
