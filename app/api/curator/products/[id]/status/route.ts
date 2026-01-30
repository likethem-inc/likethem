import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/curator/products/[id]/status - Toggle product active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = `curator-product-status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    // Only curators can update their product status
    requireApiRole(user, 'CURATOR')

    const { id } = await params

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get current product to verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: { 
        id: true, 
        title: true, 
        isActive: true,
        curatorId: true 
      },
    })

    if (!product) {
      return createApiErrorResponse('Product not found', 404)
    }

    // Ensure the product belongs to the curator
    if (product.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to modify this product', 403)
    }

    const oldStatus = product.isActive
    const newStatus = !oldStatus

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isActive: newStatus },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    })

    console.log(`[CURATOR_PRODUCT_STATUS][${correlationId}]`, {
      curatorId: curatorProfile.id,
      userId: user.id,
      productId: id,
      productTitle: product.title,
      oldStatus,
      newStatus,
    })

    return createApiSuccessResponse({
      message: 'Product status updated successfully',
      product: updatedProduct,
      oldStatus,
      newStatus,
    })
  } catch (error) {
    console.error(`[CURATOR_PRODUCT_STATUS][${correlationId}][ERROR]`, error)
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    return createApiErrorResponse('Internal server error', 500)
  }
}
