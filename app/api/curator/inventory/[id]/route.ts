import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// PUT /api/curator/inventory/[id] - Update a specific variant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can manage their inventory
    requireApiRole(user, 'CURATOR')

    const { stockQuantity, sku } = await request.json()

    // Validation
    if (stockQuantity === undefined || stockQuantity < 0) {
      return createApiErrorResponse('Valid stock quantity is required', 400)
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get the variant with its product
    const variant = await prisma.productVariant.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            curatorId: true
          }
        }
      }
    })

    if (!variant) {
      return createApiErrorResponse('Variant not found', 404)
    }

    // Check if the variant's product belongs to the curator
    if (variant.product.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to manage this variant', 403)
    }

    // Update the variant
    const updatedVariant = await prisma.productVariant.update({
      where: { id: params.id },
      data: {
        stockQuantity: stockQuantity,
        ...(sku !== undefined && { sku: sku || null })
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true
          }
        }
      }
    })

    return createApiSuccessResponse({
      message: 'Variant updated successfully',
      variant: updatedVariant
    })

  } catch (error) {
    console.error('Error updating variant:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE /api/curator/inventory/[id] - Delete a specific variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can manage their inventory
    requireApiRole(user, 'CURATOR')

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get the variant with its product
    const variant = await prisma.productVariant.findUnique({
      where: { id: params.id },
      include: {
        product: {
          select: {
            curatorId: true
          }
        }
      }
    })

    if (!variant) {
      return createApiErrorResponse('Variant not found', 404)
    }

    // Check if the variant's product belongs to the curator
    if (variant.product.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to delete this variant', 403)
    }

    // Delete the variant
    await prisma.productVariant.delete({
      where: { id: params.id }
    })

    return createApiSuccessResponse({
      message: 'Variant deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting variant:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}
