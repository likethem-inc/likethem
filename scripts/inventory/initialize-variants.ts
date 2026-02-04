/**
 * Script to initialize product variants for existing products
 * 
 * This script creates variants for products that don't have any variants yet.
 * It distributes the existing product stock across all size/color combinations.
 * 
 * Usage:
 *   ts-node --compiler-options '{"module":"commonjs"}' scripts/inventory/initialize-variants.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function initializeVariants() {
  console.log('🚀 Starting variant initialization...\n')

  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    })

    console.log(`📦 Found ${products.length} products\n`)

    let totalCreated = 0
    let productsProcessed = 0
    let productsSkipped = 0

    for (const product of products) {
      // Skip if product already has variants
      if (product.variants.length > 0) {
        console.log(`⏭️  Skipping "${product.title}" - already has ${product.variants.length} variants`)
        productsSkipped++
        continue
      }

      // Parse sizes and colors
      const sizes = product.sizes
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const colors = product.colors
        .split(',')
        .map(c => c.trim())
        .filter(Boolean)

      if (sizes.length === 0 || colors.length === 0) {
        console.log(`⚠️  Skipping "${product.title}" - no sizes or colors defined`)
        productsSkipped++
        continue
      }

      console.log(`\n📝 Processing: ${product.title}`)
      console.log(`   Sizes: ${sizes.join(', ')}`)
      console.log(`   Colors: ${colors.join(', ')}`)
      console.log(`   Current stock: ${product.stockQuantity}`)

      // Calculate stock per variant
      const totalVariants = sizes.length * colors.length
      const stockPerVariant = Math.floor(product.stockQuantity / totalVariants)
      const remainderStock = product.stockQuantity % totalVariants

      console.log(`   Creating ${totalVariants} variants with ${stockPerVariant} stock each`)

      let variantsCreated = 0

      // Create variants
      for (let i = 0; i < sizes.length; i++) {
        for (let j = 0; j < colors.length; j++) {
          const size = sizes[i]
          const color = colors[j]

          // Give remainder stock to first variant
          const stock = variantsCreated === 0 
            ? stockPerVariant + remainderStock 
            : stockPerVariant

          try {
            await prisma.productVariant.create({
              data: {
                productId: product.id,
                size,
                color,
                stockQuantity: stock
              }
            })

            variantsCreated++
            totalCreated++
          } catch (error) {
            console.error(`   ❌ Error creating variant (${size}, ${color}):`, error)
          }
        }
      }

      console.log(`   ✅ Created ${variantsCreated} variants`)
      productsProcessed++
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Summary:')
    console.log(`   Total products: ${products.length}`)
    console.log(`   Processed: ${productsProcessed}`)
    console.log(`   Skipped: ${productsSkipped}`)
    console.log(`   Variants created: ${totalCreated}`)
    console.log('='.repeat(60))
    console.log('\n✨ Variant initialization complete!\n')

  } catch (error) {
    console.error('❌ Error during initialization:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
initializeVariants()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
