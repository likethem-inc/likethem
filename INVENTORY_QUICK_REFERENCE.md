# Inventory Management - Quick Reference

## API Endpoints Summary

### Curator Inventory Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/curator/inventory` | GET | Get all variants for curator |
| `/api/curator/inventory` | POST | Create/update multiple variants |
| `/api/curator/inventory/[id]` | PUT | Update single variant |
| `/api/curator/inventory/[id]` | DELETE | Delete variant |
| `/api/curator/inventory/csv` | GET | Download inventory CSV |
| `/api/curator/inventory/csv` | POST | Upload inventory CSV |
| `/api/curator/inventory/csv/template` | GET | Download CSV template |

### Public Product APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/[slug]/variants` | GET | Get variants for a product |

## CSV Format

```csv
productSlug,size,color,stock,sku
example-product,S,Red,10,SKU-001
example-product,M,Red,15,SKU-002
example-product,L,Blue,20,SKU-003
```

## Database Schema

```prisma
model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  size          String
  color         String
  stockQuantity Int      @default(0)
  sku           String?  @unique
  product       Product  @relation(...)
  
  @@unique([productId, size, color])
}
```

## Key Files

```
📁 app/api/curator/inventory/
  ├── route.ts                    # Main inventory CRUD
  ├── [id]/route.ts              # Single variant operations
  └── csv/
      ├── route.ts               # CSV import/export
      └── template/route.ts      # CSV template

📁 components/curator/inventory/
  ├── InventoryList.tsx          # Main inventory table
  └── CSVImportExport.tsx        # Bulk import/export UI

📁 app/dashboard/curator/
  └── inventory/page.tsx         # Inventory management page

📁 lib/inventory/
  └── variants.ts                # Utility functions

📁 prisma/migrations/
  └── 20260204045044_add_product_variants/
      └── migration.sql          # Database migration
```

## Common Tasks

### Create/Update Variants

```typescript
// POST /api/curator/inventory
{
  "productId": "product-id",
  "variants": [
    { "size": "M", "color": "Red", "stockQuantity": 10 }
  ]
}
```

### Check Availability

```typescript
import { checkVariantAvailability } from '@/lib/inventory/variants'

const result = await checkVariantAvailability(
  'product-id',
  'M',
  'Red',
  2 // quantity
)
// Returns: { available: boolean, stockQuantity: number, variantId: string | null }
```

### Initialize Product Variants

```typescript
import { initializeProductVariants } from '@/lib/inventory/variants'

await initializeProductVariants(
  'product-id',
  ['S', 'M', 'L'],
  ['Red', 'Blue'],
  10 // default stock
)
```

## UI Components Usage

### Inventory List

```tsx
import InventoryList from '@/components/curator/inventory/InventoryList'

<InventoryList onEdit={(variant) => console.log(variant)} />
```

### CSV Import/Export

```tsx
import CSVImportExport from '@/components/curator/inventory/CSVImportExport'

<CSVImportExport onImportSuccess={() => console.log('Import done!')} />
```

## Order Integration

When creating orders, the system now:

1. ✅ Validates size and color are provided
2. ✅ Checks variant stock availability
3. ✅ Reduces variant stock (not product stock)
4. ✅ Uses transactions for atomic operations

## Stock Status Indicators

| Color | Status | Condition |
|-------|--------|-----------|
| 🔴 Red | Out of stock | stockQuantity = 0 |
| 🟡 Yellow | Low stock | stockQuantity < 5 |
| ⚪ White | In stock | stockQuantity ≥ 5 |

## Migration

### Apply Database Changes

```bash
npx prisma migrate deploy
```

### Generate Prisma Client

```bash
npx prisma generate
```

## Testing Checklist

- [ ] Create variants via API
- [ ] Update stock via dashboard
- [ ] Download inventory CSV
- [ ] Upload inventory CSV
- [ ] Create order with variants
- [ ] Verify stock reduction
- [ ] Test low stock validation
- [ ] Test out-of-stock validation

## Need Help?

See `INVENTORY_MANAGEMENT_GUIDE.md` for detailed documentation.
