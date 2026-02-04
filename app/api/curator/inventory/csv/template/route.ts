import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse } from '@/lib/api-auth'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

// GET /api/curator/inventory/csv/template - Download CSV template
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can download template
    requireApiRole(user, 'CURATOR')

    // Generate CSV template
    const csvContent = `productSlug,size,color,stock,sku
example-product-slug,S,Red,10,SKU-001
example-product-slug,M,Red,15,SKU-002
example-product-slug,L,Blue,20,SKU-003`

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="inventory-template.csv"'
      }
    })

  } catch (error) {
    console.error('Error downloading template:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}
