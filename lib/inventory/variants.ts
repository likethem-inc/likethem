import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface VariantAvailability {
  available: boolean
  stockQuantity: number
  variantId: string | null
}

/**
 * Check if a specific product variant has sufficient stock
 */
export async function checkVariantAvailability(
  productId: string,
  size: string,
  color: string,
  requestedQuantity: number = 1
): Promise<VariantAvailability> {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: {
        productId_size_color: {
          productId,
          size,
          color
        }
      }
    })

    if (!variant) {
      return {
        available: false,
        stockQuantity: 0,
        variantId: null
      }
    }

    return {
      available: variant.stockQuantity >= requestedQuantity,
      stockQuantity: variant.stockQuantity,
      variantId: variant.id
    }
  } catch (error) {
    console.error('Error checking variant availability:', error)
    return {
      available: false,
      stockQuantity: 0,
      variantId: null
    }
  }
}

/**
 * Get all available variants for a product
 */
export async function getProductVariants(productId: string) {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [
        { size: 'asc' },
        { color: 'asc' }
      ]
    })

    return variants
  } catch (error) {
    console.error('Error fetching product variants:', error)
    return []
  }
}

/**
 * Update variant stock quantity
 */
export async function updateVariantStock(
  variantId: string,
  quantity: number,
  operation: 'increment' | 'decrement' | 'set' = 'set'
) {
  try {
    const updateData =
      operation === 'set'
        ? { stockQuantity: quantity }
        : operation === 'increment'
        ? { stockQuantity: { increment: quantity } }
        : { stockQuantity: { decrement: quantity } }

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData
    })

    return variant
  } catch (error) {
    console.error('Error updating variant stock:', error)
    throw error
  }
}

/**
 * Create or update a product variant
 */
export async function upsertVariant(
  productId: string,
  size: string,
  color: string,
  stockQuantity: number,
  sku?: string
) {
  try {
    const variant = await prisma.productVariant.upsert({
      where: {
        productId_size_color: {
          productId,
          size,
          color
        }
      },
      update: {
        stockQuantity,
        ...(sku !== undefined && { sku: sku || null })
      },
      create: {
        productId,
        size,
        color,
        stockQuantity,
        sku: sku || null
      }
    })

    return variant
  } catch (error) {
    console.error('Error upserting variant:', error)
    throw error
  }
}

/**
 * Initialize variants for a product based on its sizes and colors
 */
export async function initializeProductVariants(
  productId: string,
  sizes: string[],
  colors: string[],
  defaultStock: number = 0
) {
  try {
    const variants = []

    for (const size of sizes) {
      for (const color of colors) {
        const variant = await upsertVariant(
          productId,
          size,
          color,
          defaultStock
        )
        variants.push(variant)
      }
    }

    return variants
  } catch (error) {
    console.error('Error initializing variants:', error)
    throw error
  }
}

/**
 * Get total stock across all variants of a product
 */
export async function getProductTotalStock(productId: string): Promise<number> {
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: { stockQuantity: true }
    })

    return variants.reduce((total, variant) => total + variant.stockQuantity, 0)
  } catch (error) {
    console.error('Error getting product total stock:', error)
    return 0
  }
}

/**
 * Check if any variant of a product is in stock
 */
export async function isProductInStock(productId: string): Promise<boolean> {
  try {
    const variant = await prisma.productVariant.findFirst({
      where: {
        productId,
        stockQuantity: { gt: 0 }
      }
    })

    return variant !== null
  } catch (error) {
    console.error('Error checking product stock:', error)
    return false
  }
}
