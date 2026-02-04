import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/curator/inventory/csv - Download inventory as CSV
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can download their inventory
    requireApiRole(user, 'CURATOR')

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get all variants for this curator's products
    const variants = await prisma.productVariant.findMany({
      where: {
        product: {
          curatorId: curatorProfile.id
        }
      },
      include: {
        product: {
          select: {
            slug: true,
            title: true
          }
        }
      },
      orderBy: [
        { product: { title: 'asc' } },
        { size: 'asc' },
        { color: 'asc' }
      ]
    })

    // Generate CSV content
    const csvHeader = 'productSlug,size,color,stock,sku,productTitle\n'
    const csvRows = variants.map(variant => {
      return `${variant.product.slug},${variant.size},${variant.color},${variant.stockQuantity},${variant.sku || ''},${variant.product.title}`
    }).join('\n')

    const csvContent = csvHeader + csvRows

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="inventory-${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Error downloading inventory:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/curator/inventory/csv - Upload inventory via CSV
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can upload their inventory
    requireApiRole(user, 'CURATOR')

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    const { csvData } = await request.json()

    if (!csvData) {
      return createApiErrorResponse('CSV data is required', 400)
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n')
    if (lines.length < 2) {
      return createApiErrorResponse('CSV must contain at least a header and one data row', 400)
    }

    // Skip header line
    const dataLines = lines.slice(1)

    // Validate and process each line
    const variantsToUpdate: Array<{
      productSlug: string
      size: string
      color: string
      stock: number
      sku?: string
    }> = []

    const errors: string[] = []

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim()
      if (!line) continue // Skip empty lines

      const parts = line.split(',')
      if (parts.length < 4) {
        errors.push(`Line ${i + 2}: Invalid format - expected at least 4 columns`)
        continue
      }

      const [productSlug, size, color, stockStr, sku] = parts.map((p: string) => p.trim())

      // Validate required fields
      if (!productSlug || !size || !color || !stockStr) {
        errors.push(`Line ${i + 2}: Missing required fields (productSlug, size, color, or stock)`)
        continue
      }

      // Validate stock is a number
      const stock = parseInt(stockStr)
      if (isNaN(stock) || stock < 0) {
        errors.push(`Line ${i + 2}: Invalid stock quantity '${stockStr}' - must be a non-negative number`)
        continue
      }

      variantsToUpdate.push({
        productSlug,
        size,
        color,
        stock,
        sku: sku || undefined
      })
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'CSV validation failed',
        errors: errors
      }, { status: 400 })
    }

    if (variantsToUpdate.length === 0) {
      return createApiErrorResponse('No valid data found in CSV', 400)
    }

    // Get all product slugs
    const uniqueSlugs = new Set(variantsToUpdate.map(v => v.productSlug))
    const productSlugs = Array.from(uniqueSlugs)

    // Fetch all products in one query
    const products = await prisma.product.findMany({
      where: {
        slug: { in: productSlugs },
        curatorId: curatorProfile.id
      },
      select: {
        id: true,
        slug: true
      }
    })

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.slug, p.id]))

    // Validate all products exist and belong to curator
    const missingProducts: string[] = []
    for (const slug of productSlugs) {
      if (!productMap.has(slug)) {
        missingProducts.push(slug)
      }
    }

    if (missingProducts.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Some products not found or do not belong to you',
        missingProducts: missingProducts
      }, { status: 400 })
    }

    // Update variants in transaction
    const results = await prisma.$transaction(async (tx) => {
      const updated = []
      const created = []

      for (const variantData of variantsToUpdate) {
        const productId = productMap.get(variantData.productSlug)!

        const variant = await tx.productVariant.upsert({
          where: {
            productId_size_color: {
              productId: productId,
              size: variantData.size,
              color: variantData.color
            }
          },
          update: {
            stockQuantity: variantData.stock,
            ...(variantData.sku && { sku: variantData.sku })
          },
          create: {
            productId: productId,
            size: variantData.size,
            color: variantData.color,
            stockQuantity: variantData.stock,
            sku: variantData.sku || null
          }
        })

        if (variant.createdAt.getTime() === variant.updatedAt.getTime()) {
          created.push(variant)
        } else {
          updated.push(variant)
        }
      }

      return { updated, created }
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory updated successfully',
      summary: {
        totalProcessed: variantsToUpdate.length,
        created: results.created.length,
        updated: results.updated.length
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Error uploading inventory:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  } finally {
    await prisma.$disconnect()
  }
}
