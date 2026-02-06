# 🚀 Guía de Implementación: Fix de Variantes

## ⏱️ Tiempo Estimado: 15 minutos

---

## 📝 Checklist de Implementación

- [ ] Backup de archivos actuales
- [ ] Modificar `/app/api/products/route.ts`
- [ ] Modificar `/app/api/curator/products/[id]/route.ts`
- [ ] Ejecutar migración para productos existentes
- [ ] Probar creación de nuevo producto
- [ ] Probar edición de producto existente
- [ ] Verificar inventario en dashboard

---

## 🔧 PASO 1: Backup (Opcional pero recomendado)

```bash
cd /home/runner/work/likethem/likethem

# Crear backups
cp app/api/products/route.ts app/api/products/route.ts.backup
cp app/api/curator/products/[id]/route.ts app/api/curator/products/[id]/route.ts.backup
```

---

## 🔧 PASO 2: Modificar `/app/api/products/route.ts`

### 2.1 Agregar Import (Línea 4)

**Ubicación:** Después de las importaciones existentes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '@/lib/slugify'
// ✅ AGREGAR:
import { initializeProductVariants } from '@/lib/inventory/variants'
```

### 2.2 Modificar la Transacción (Línea ~145)

**Ubicación:** Dentro de la función POST, después de crear las imágenes

**ANTES:**
```typescript
    // Create product with transaction
    const product = await prisma.$transaction(async (tx: any) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          curatorId: curatorProfile.id,
          title,
          description,
          price: parseFloat(price),
          category,
          tags: tags || '',
          sizes: sizes || '',
          colors: colors || '',
          stockQuantity: parseInt(stockQuantity) || 0,
          curatorNote: curatorNote || null,
          slug
        }
      })

      // Create product images
      const productImages = await Promise.all(
        images.map((image: any, index: number) =>
          tx.productImage.create({
            data: {
              productId: newProduct.id,
              url: image.url,
              altText: image.altText || '',
              order: index
            }
          })
        )
      )

      return {
        ...newProduct,
        images: productImages
      }
    })
```

**DESPUÉS:**
```typescript
    // Create product with transaction
    const product = await prisma.$transaction(async (tx: any) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          curatorId: curatorProfile.id,
          title,
          description,
          price: parseFloat(price),
          category,
          tags: tags || '',
          sizes: sizes || '',
          colors: colors || '',
          stockQuantity: parseInt(stockQuantity) || 0,
          curatorNote: curatorNote || null,
          slug
        }
      })

      // Create product images
      const productImages = await Promise.all(
        images.map((image: any, index: number) =>
          tx.productImage.create({
            data: {
              productId: newProduct.id,
              url: image.url,
              altText: image.altText || '',
              order: index
            }
          })
        )
      )

      // ✅ AGREGAR: Initialize product variants
      if (sizes && colors) {
        const sizeArray = (sizes as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
        
        const colorArray = (colors as string)
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean)
        
        if (sizeArray.length > 0 && colorArray.length > 0) {
          const totalVariants = sizeArray.length * colorArray.length
          const stockPerVariant = Math.floor(
            (parseInt(stockQuantity) || 0) / totalVariants
          )
          
          console.log(`Creating ${totalVariants} variants with ${stockPerVariant} stock each`)
          
          await initializeProductVariants(
            newProduct.id,
            sizeArray,
            colorArray,
            stockPerVariant
          )
        }
      }

      return {
        ...newProduct,
        images: productImages
      }
    })
```

---

## 🔧 PASO 3: Modificar `/app/api/curator/products/[id]/route.ts`

### 3.1 Agregar Import (Línea 4)

**Ubicación:** Después de las importaciones existentes

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse, ensureCuratorOwnership } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '@/lib/slugify'
// ✅ AGREGAR:
import { initializeProductVariants } from '@/lib/inventory/variants'
```

### 3.2 Modificar la Transacción PUT (Línea ~176)

**Ubicación:** Dentro de la función PUT, después de recrear las imágenes

**ANTES:**
```typescript
    // Update product with transaction
    const product = await prisma.$transaction(async (tx: any) => {
      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: {
          title,
          description,
          price: parseFloat(price),
          category,
          tags: tags || '',
          sizes: sizes || '',
          colors: colors || '',
          stockQuantity: parseInt(stockQuantity) || 0,
          curatorNote: curatorNote || null,
          slug
        }
      })

      // Delete old images
      await tx.productImage.deleteMany({
        where: { productId: params.id }
      })

      // Create new product images
      const productImages = await Promise.all(
        images.map((image: any, index: number) =>
          tx.productImage.create({
            data: {
              productId: params.id,
              url: image.url,
              altText: image.altText || '',
              order: index
            }
          })
        )
      )

      return {
        ...updatedProduct,
        images: productImages
      }
    })
```

**DESPUÉS:**
```typescript
    // Update product with transaction
    const product = await prisma.$transaction(async (tx: any) => {
      // Update product
      const updatedProduct = await tx.product.update({
        where: { id: params.id },
        data: {
          title,
          description,
          price: parseFloat(price),
          category,
          tags: tags || '',
          sizes: sizes || '',
          colors: colors || '',
          stockQuantity: parseInt(stockQuantity) || 0,
          curatorNote: curatorNote || null,
          slug
        }
      })

      // Delete old images
      await tx.productImage.deleteMany({
        where: { productId: params.id }
      })

      // Create new product images
      const productImages = await Promise.all(
        images.map((image: any, index: number) =>
          tx.productImage.create({
            data: {
              productId: params.id,
              url: image.url,
              altText: image.altText || '',
              order: index
            }
          })
        )
      )

      // ✅ AGREGAR: Sync product variants
      // First, delete all existing variants
      await tx.productVariant.deleteMany({
        where: { productId: params.id }
      })
      
      // Then, create new variants based on updated sizes/colors
      if (sizes && colors) {
        const sizeArray = (sizes as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean)
        
        const colorArray = (colors as string)
          .split(',')
          .map((c: string) => c.trim())
          .filter(Boolean)
        
        if (sizeArray.length > 0 && colorArray.length > 0) {
          const totalVariants = sizeArray.length * colorArray.length
          const stockPerVariant = Math.floor(
            (parseInt(stockQuantity) || 0) / totalVariants
          )
          
          console.log(`Updating ${totalVariants} variants with ${stockPerVariant} stock each`)
          
          await initializeProductVariants(
            params.id,
            sizeArray,
            colorArray,
            stockPerVariant
          )
        }
      }

      return {
        ...updatedProduct,
        images: productImages
      }
    })
```

---

## 🔧 PASO 4: Migrar Productos Existentes

### 4.1 Verificar productos sin variantes

```bash
# Conectarse a la base de datos y ejecutar:
SELECT 
  p.id,
  p.title,
  p.sizes,
  p.colors,
  COUNT(v.id) as variant_count
FROM products p
LEFT JOIN product_variants v ON v.productId = p.id
GROUP BY p.id
HAVING COUNT(v.id) = 0;
```

### 4.2 Ejecutar Script de Migración

```bash
cd /home/runner/work/likethem/likethem

# Ejecutar script de inicialización
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/inventory/initialize-variants.ts
```

**Salida esperada:**
```
🚀 Starting variant initialization...

📦 Found X products

📝 Processing: Product Name
   Sizes: S, M, L
   Colors: Black, White
   Current stock: 12
   Creating 6 variants with 2 stock each
   ✅ Created 6 variants

============================================================
📊 Summary:
   Total products: X
   Processed: Y
   Skipped: Z
   Variants created: N
============================================================

✨ Variant initialization complete!
```

---

## ✅ PASO 5: Verificación

### 5.1 Test: Crear Nuevo Producto

```bash
# 1. Ir a: http://localhost:3000/dashboard/curator/products/new
# 2. Crear producto con:
#    - Sizes: S, M, L
#    - Colors: Black, White
#    - Stock: 12
# 3. Guardar
```

**Verificar en DB:**
```sql
-- Obtener el ID del producto recién creado
SELECT id, title FROM products ORDER BY createdAt DESC LIMIT 1;

-- Verificar variantes (debería mostrar 6 registros)
SELECT size, color, stockQuantity 
FROM product_variants 
WHERE productId = 'PRODUCT_ID_AQUI';
```

### 5.2 Test: Editar Producto Existente

```bash
# 1. Ir a: http://localhost:3000/dashboard/curator/products
# 2. Editar un producto
# 3. Cambiar sizes de "S,M" a "S,M,L,XL"
# 4. Guardar
```

**Verificar en DB:**
```sql
-- Verificar que ahora hay más variantes
SELECT size, color, stockQuantity 
FROM product_variants 
WHERE productId = 'PRODUCT_ID_AQUI';
```

### 5.3 Test: Ver Inventario

```bash
# Ir a: http://localhost:3000/dashboard/curator/inventory
# Debería mostrar todas las variantes con su stock
```

---

## 🎯 Resultados Esperados

### Antes del Fix ❌
```
products table:
  - id: prod_1
  - sizes: "S,M,L"
  - colors: "Black,White"

product_variants table:
  (vacía)

Dashboard Inventory: "No hay productos"
```

### Después del Fix ✅
```
products table:
  - id: prod_1
  - sizes: "S,M,L"
  - colors: "Black,White"

product_variants table:
  - { productId: prod_1, size: "S", color: "Black", stock: 2 }
  - { productId: prod_1, size: "S", color: "White", stock: 2 }
  - { productId: prod_1, size: "M", color: "Black", stock: 2 }
  - { productId: prod_1, size: "M", color: "White", stock: 2 }
  - { productId: prod_1, size: "L", color: "Black", stock: 2 }
  - { productId: prod_1, size: "L", color: "White", stock: 2 }

Dashboard Inventory: Muestra 6 variantes con controles de stock
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/lib/inventory/variants'"

**Solución:** Verificar que el archivo existe en la ruta correcta:
```bash
ls -la /home/runner/work/likethem/likethem/lib/inventory/variants.ts
```

### Error: "initializeProductVariants is not a function"

**Solución:** Verificar que el import es correcto:
```typescript
import { initializeProductVariants } from '@/lib/inventory/variants'
```

### Error: "Cannot read property 'split' of undefined"

**Solución:** El campo sizes o colors está vacío. Verificar la condición:
```typescript
if (sizes && colors) {
  // ...
}
```

### Las variantes no aparecen después de crear producto

**Solución:**
1. Revisar logs del servidor (consola donde corre `npm run dev`)
2. Buscar el mensaje: "Creating X variants with Y stock each"
3. Si no aparece, verificar que la transacción se completó
4. Verificar manualmente en la DB:
```sql
SELECT * FROM product_variants ORDER BY createdAt DESC LIMIT 10;
```

---

## 📊 Monitoreo Post-Fix

### Query útil para monitorear

```sql
-- Ver estado de variantes por producto
SELECT 
  p.title,
  p.sizes,
  p.colors,
  COUNT(v.id) as variant_count,
  SUM(v.stockQuantity) as total_stock
FROM products p
LEFT JOIN product_variants v ON v.productId = p.id
GROUP BY p.id
ORDER BY p.createdAt DESC;
```

---

## ✅ Checklist Final

- [ ] ✅ Archivos modificados correctamente
- [ ] ✅ Imports agregados
- [ ] ✅ Script de migración ejecutado
- [ ] ✅ Nuevo producto crea variantes automáticamente
- [ ] ✅ Editar producto actualiza variantes
- [ ] ✅ Dashboard de inventario muestra datos
- [ ] ✅ Logs del servidor muestran "Creating X variants..."
- [ ] ✅ Base de datos tiene registros en `product_variants`

---

## 🎉 ¡Fix Completado!

Una vez completados todos los pasos, el sistema de variantes estará funcionando correctamente.

**Siguientes pasos recomendados:**
1. Documentar en changelog
2. Notificar a curadores sobre nueva funcionalidad de inventario
3. Crear video tutorial sobre gestión de inventario
4. Considerar agregar tests automatizados

---

**Tiempo real de implementación:** ~10-15 minutos
**Complejidad:** Baja (solo agregar código, no modificar lógica existente)
**Riesgo:** Bajo (no afecta funcionalidad existente)
