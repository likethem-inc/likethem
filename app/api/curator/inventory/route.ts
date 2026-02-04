import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/curator/inventory - Get all product variants with inventory
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can access their inventory
    requireApiRole(user, 'CURATOR')

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    // Build where clause
    const whereClause: any = {
      product: {
        curatorId: curatorProfile.id
      }
    }

    if (productId) {
      whereClause.productId = productId
    }

    // Get all variants for this curator's products
    const variants = await prisma.productVariant.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            isActive: true,
            images: {
              select: { url: true, altText: true },
              take: 1,
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: [
        { product: { title: 'asc' } },
        { size: 'asc' },
        { color: 'asc' }
      ]
    })

    return createApiSuccessResponse({
      variants,
      total: variants.length
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/curator/inventory - Create or update product variants
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can manage their inventory
    requireApiRole(user, 'CURATOR')

    const { productId, variants } = await request.json()

    // Validation
    if (!productId) {
      return createApiErrorResponse('Product ID is required', 400)
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return createApiErrorResponse('Variants array is required', 400)
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Check if product exists and belongs to the curator
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return createApiErrorResponse('Product not found', 404)
    }

    if (product.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to manage this product', 403)
    }

    // Validate variant data
    for (const variant of variants) {
      if (!variant.size || !variant.color) {
        return createApiErrorResponse('Size and color are required for each variant', 400)
      }
      if (variant.stockQuantity === undefined || variant.stockQuantity < 0) {
        return createApiErrorResponse('Valid stock quantity is required for each variant', 400)
      }
    }

    // Create or update variants
    const results = await prisma.$transaction(async (tx) => {
      const updatedVariants = []

      for (const variantData of variants) {
        const variant = await tx.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: productId,
              size: variantData.size,
              color: variantData.color
            }
          },
          update: {
            stockQuantity: variantData.stockQuantity,
            sku: variantData.sku || null
          },
          create: {
            productId: productId,
            size: variantData.size,
            color: variantData.color,
            stockQuantity: variantData.stockQuantity,
            sku: variantData.sku || null
          }
        })

        updatedVariants.push(variant)
      }

      return updatedVariants
    })

    return createApiSuccessResponse({
      message: 'Inventory updated successfully',
      variants: results
    })

  } catch (error) {
    console.error('Error updating inventory:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}
