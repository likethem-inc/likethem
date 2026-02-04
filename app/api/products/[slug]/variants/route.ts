import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/products/[slug]/variants - Get all variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Find product by slug
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      select: { id: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Get all variants for this product
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id },
      orderBy: [
        { size: 'asc' },
        { color: 'asc' }
      ]
    })

    // Group variants by size and color for easier frontend consumption
    const variantMap: {
      [size: string]: {
        [color: string]: {
          id: string
          stockQuantity: number
          available: boolean
        }
      }
    } = {}

    variants.forEach(variant => {
      if (!variantMap[variant.size]) {
        variantMap[variant.size] = {}
      }
      variantMap[variant.size][variant.color] = {
        id: variant.id,
        stockQuantity: variant.stockQuantity,
        available: variant.stockQuantity > 0
      }
    })

    return NextResponse.json({
      success: true,
      variants: variants,
      variantMap: variantMap
    })

  } catch (error) {
    console.error('Error fetching variants:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
