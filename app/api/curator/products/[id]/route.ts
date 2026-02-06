import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse, ensureCuratorOwnership } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '@/lib/slugify'
import { initializeProductVariants } from '@/lib/inventory/variants'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/curator/products/[id] - Get a specific product by ID (curator only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can access their products
    requireApiRole(user, 'CURATOR')

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get product by ID
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!product) {
      return createApiErrorResponse('Product not found', 404)
    }

    // Ensure the product belongs to the curator
    if (product.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to access this product', 403)
    }

    return createApiSuccessResponse(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}

// PUT /api/curator/products/[id] - Update a product by ID (curator only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can update their products
    requireApiRole(user, 'CURATOR')

    const {
      title,
      description,
      price,
      category,
      tags,
      sizes,
      colors,
      stockQuantity,
      curatorNote,
      images
    } = await request.json()

    // Validation
    if (!title || !description || price === undefined || !category) {
      return createApiErrorResponse('Missing required fields', 400)
    }

    if (!images || images.length === 0) {
      return createApiErrorResponse('At least one image is required', 400)
    }

    if (images.length > 5) {
      return createApiErrorResponse('Maximum 5 images allowed', 400)
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Check if product exists and belongs to the curator
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    })

    if (!existingProduct) {
      return createApiErrorResponse('Product not found', 404)
    }

    if (existingProduct.curatorId !== curatorProfile.id) {
      return createApiErrorResponse('Unauthorized to update this product', 403)
    }

    // Check if title changed and generate new slug if needed
    let slug = existingProduct.slug
    if (title !== existingProduct.title) {
      slug = await generateUniqueSlug(title, 'product')
    }

    // Parse sizes and colors from comma-separated strings to arrays
    const sizesArray = sizes ? sizes.split(',').map((s: string) => s.trim()).filter(Boolean) : []
    const colorsArray = colors ? colors.split(',').map((c: string) => c.trim()).filter(Boolean) : []
    
    // Calculate stock per variant
    const totalStock = parseInt(stockQuantity) || 0
    const variantCount = sizesArray.length * colorsArray.length
    const stockPerVariant = variantCount > 0 ? Math.floor(totalStock / variantCount) : totalStock

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

      // Delete existing variants to reinitialize with new sizes/colors
      // Note: This will reset any manually adjusted stock levels for individual variants.
      // The stock will be redistributed evenly based on the total stockQuantity.
      await tx.productVariant.deleteMany({
        where: { productId: params.id }
      })

      // Initialize product variants if sizes and colors are provided
      if (sizesArray.length > 0 && colorsArray.length > 0) {
        await initializeProductVariants(
          params.id,
          sizesArray,
          colorsArray,
          stockPerVariant
        )
      }

      return {
        ...updatedProduct,
        images: productImages
      }
    })

    return createApiSuccessResponse({
      message: 'Product updated successfully',
      product
    })

  } catch (error) {
    console.error('Error updating product:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}
