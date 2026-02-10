# Inventory Management System - Implementation Guide

## Overview

This document describes the implementation of the variant-based inventory management system for the likethem platform.

## Features Implemented

### 1. Database Schema Changes

#### ProductVariant Model
A new `ProductVariant` model has been added to track inventory by size/color combinations:

```prisma
model ProductVariant {
  id            String   @id @default(cuid())
  productId     String
  size          String
  color         String
  stockQuantity Int      @default(0)
  sku           String?  @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, size, color])
  @@map("product_variants")
}
```

**Key Features:**
- Each variant has a unique combination of productId, size, and color
- Optional SKU field for internal tracking
- Cascading delete when product is deleted
- Timestamps for audit trail

### 2. API Endpoints

#### Inventory Management APIs

**GET /api/curator/inventory**
- Fetch all product variants with inventory for the logged-in curator
- Optional query parameter: `productId` to filter by specific product
- Returns variants with product information and stock levels

**POST /api/curator/inventory**
- Create or update multiple product variants
- Request body:
  ```json
  {
    "productId": "product-id",
    "variants": [
      {
        "size": "M",
        "color": "Red",
        "stockQuantity": 10,
        "sku": "SKU-001" // optional
      }
    ]
  }
  ```

**PUT /api/curator/inventory/[id]**
- Update a specific variant's stock quantity
- Request body:
  ```json
  {
    "stockQuantity": 15,
    "sku": "SKU-002" // optional
  }
  ```

**DELETE /api/curator/inventory/[id]**
- Delete a specific variant

#### CSV Import/Export APIs

**GET /api/curator/inventory/csv**
- Download current inventory as CSV file
- Format: `productSlug,size,color,stock,sku,productTitle`

**POST /api/curator/inventory/csv**
- Upload CSV to bulk update inventory
- Request body:
  ```json
  {
    "csvData": "productSlug,size,color,stock,sku\nproduct-1,S,Red,10,SKU-001"
  }
  ```
- Validates all data before processing
- Returns summary of created/updated variants

**GET /api/curator/inventory/csv/template**
- Download CSV template with example data

#### Product Variant APIs

**GET /api/products/[slug]/variants**
- Get all variants for a specific product
- Returns variants array and a convenient variantMap grouped by size and color
- Used by product detail pages to show availability

### 3. Order Creation Updates

The order creation logic has been updated to work with variant-based inventory:

**Stock Validation:**
- Validates that size and color are provided for each order item
- Checks variant stock availability before creating order
- Returns detailed error messages if variant not found or insufficient stock

**Stock Reduction:**
- Reduces stock at the variant level (not product level)
- Happens within transaction when order is created and payment confirmed
- Atomic operation ensures no race conditions

### 4. UI Components

#### InventoryList Component
Location: `/components/curator/inventory/InventoryList.tsx`

Features:
- Displays all variants in a table format
- Search/filter by product name, size, color, or SKU
- Inline stock editing with visual feedback
- Color-coded stock status (out of stock, low stock, in stock)
- Real-time updates when stock is changed
- Product images and details for easy identification

#### CSVImportExport Component
Location: `/components/curator/inventory/CSVImportExport.tsx`

Features:
- Download current inventory as CSV
- Upload CSV to bulk update inventory
- Download CSV template
- Detailed error reporting for invalid CSV data
- Success summary showing created/updated counts
- Format instructions and examples

#### Inventory Management Page
Location: `/app/dashboard/curator/inventory/page.tsx`

Features:
- Tab-based interface (Inventory List / Import/Export)
- Help section explaining how inventory works
- Responsive design
- Integrated with curator dashboard

### 5. Utility Functions

Location: `/lib/inventory/variants.ts`

Available functions:
- `checkVariantAvailability()` - Check if variant has stock
- `getProductVariants()` - Get all variants for a product
- `updateVariantStock()` - Update stock (increment/decrement/set)
- `upsertVariant()` - Create or update a variant
- `initializeProductVariants()` - Bulk create variants
- `getProductTotalStock()` - Calculate total stock across variants
- `isProductInStock()` - Check if any variant has stock

## Migration Guide

### Database Migration

Run the migration to add the ProductVariant table:

```bash
npx prisma migrate deploy
```

Migration file: `prisma/migrations/20260204045044_add_product_variants/migration.sql`

### Data Migration (Optional)

If you have existing products with stock, you may want to migrate the data:

```typescript
// Example migration script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateProductStock() {
  const products = await prisma.product.findMany({
    where: { stockQuantity: { gt: 0 } }
  })

  for (const product of products) {
    // Parse sizes and colors from product
    const sizes = product.sizes.split(',').map(s => s.trim()).filter(Boolean)
    const colors = product.colors.split(',').map(c => c.trim()).filter(Boolean)

    // Distribute stock evenly or set to product's total stock for first variant
    const stockPerVariant = Math.floor(product.stockQuantity / (sizes.length * colors.length))

    for (const size of sizes) {
      for (const color of colors) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            size,
            color,
            stockQuantity: stockPerVariant
          }
        })
      }
    }
  }
}
```

### Frontend Integration

#### Product Detail Page

Update product detail pages to show variant availability:

```typescript
// Fetch variants
const response = await fetch(`/api/products/${productSlug}/variants`)
const { variants, variantMap } = await response.json()

// Check if selected variant is available
const selectedVariant = variantMap[selectedSize]?.[selectedColor]
const isAvailable = selectedVariant?.available
const stockQuantity = selectedVariant?.stockQuantity
```

#### Cart Logic

Update cart logic to include size and color:

```typescript
// When adding to cart
const cartItem = {
  productId: product.id,
  quantity: 1,
  size: selectedSize,
  color: selectedColor
}
```

## Usage Examples

### Curator Dashboard

1. **Navigate to Inventory Management**
   - Go to Dashboard → Inventory
   - View all product variants and stock levels

2. **Update Stock Inline**
   - Click on stock quantity field
   - Enter new value
   - Press Enter or click away to save

3. **Bulk Import Stock**
   - Go to Import/Export tab
   - Download current inventory or template
   - Edit CSV file
   - Upload to update stock

### API Usage

#### Check Variant Availability

```typescript
import { checkVariantAvailability } from '@/lib/inventory/variants'

const availability = await checkVariantAvailability(
  'product-id',
  'M',
  'Blue',
  2 // requested quantity
)

if (availability.available) {
  console.log(`${availability.stockQuantity} units available`)
} else {
  console.log('Out of stock')
}
```

#### Initialize Variants for New Product

```typescript
import { initializeProductVariants } from '@/lib/inventory/variants'

const sizes = ['S', 'M', 'L', 'XL']
const colors = ['Red', 'Blue', 'Black', 'White']

const variants = await initializeProductVariants(
  'product-id',
  sizes,
  colors,
  10 // default stock per variant
)
```

## Testing

### Manual Testing Checklist

- [ ] Create product variants via API
- [ ] Update variant stock via API
- [ ] View inventory in curator dashboard
- [ ] Edit stock inline in inventory list
- [ ] Download inventory as CSV
- [ ] Upload CSV to update inventory
- [ ] Create order with variant selection
- [ ] Verify stock reduction after order
- [ ] Test insufficient stock validation
- [ ] Test variant not found validation

### API Testing

Use the provided test scripts or tools like Postman/cURL:

```bash
# Get inventory
curl -X GET http://localhost:3000/api/curator/inventory \
  -H "Cookie: your-auth-cookie"

# Update variant
curl -X PUT http://localhost:3000/api/curator/inventory/variant-id \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{"stockQuantity": 20}'

# Get product variants
curl -X GET http://localhost:3000/api/products/product-slug/variants
```

## Performance Considerations

1. **Indexing**: The unique constraint on `[productId, size, color]` provides efficient lookups
2. **Caching**: Consider caching variant availability on product pages
3. **Pagination**: Inventory list supports pagination for large catalogs
4. **Transactions**: Stock updates use database transactions for consistency

## Future Enhancements

Potential improvements for future iterations:

1. **Low Stock Alerts**: Notify curators when variants reach low stock threshold
2. **Stock History**: Track stock changes over time
3. **Bulk Operations**: Select multiple variants for batch updates
4. **Auto-restock**: Set reorder points and quantities
5. **Reserved Stock**: Track stock in carts vs available stock
6. **Variant Images**: Allow different images per variant
7. **Price Variants**: Support different prices per variant
8. **Analytics**: Stock movement reports and insights

## Troubleshooting

### Common Issues

**Issue**: Variants not showing in inventory
- **Solution**: Ensure products have variants created. Use the `initializeProductVariants` utility.

**Issue**: CSV import fails
- **Solution**: Check CSV format matches template. Ensure product slugs exist and belong to curator.

**Issue**: Stock not reducing on order
- **Solution**: Verify size and color are provided in order items. Check transaction logs.

**Issue**: "Variant not found" error during checkout
- **Solution**: Ensure selected size/color combination exists as a variant for the product.

## Support

For questions or issues:
1. Check this documentation
2. Review API endpoint code in `/app/api/curator/inventory/`
3. Check utility functions in `/lib/inventory/variants.ts`
4. Review component code in `/components/curator/inventory/`

## Backward Compatibility

The system maintains backward compatibility:
- Product model still has `stockQuantity` field (can be deprecated later)
- Existing products without variants can still be viewed
- Migration is optional and can be done gradually
