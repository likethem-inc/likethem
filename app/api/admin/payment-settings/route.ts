import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs'

// GET /api/admin/payment-settings - Get current payment settings (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    // Only admins can access payment settings
    requireApiRole(user, 'ADMIN')

    // Get payment settings (there should only be one record)
    let settings = await prisma.paymentSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          yapeEnabled: false,
          yapePhoneNumber: null,
          yapeQRCode: null,
          yapeInstructions: 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
          plinEnabled: false,
          plinPhoneNumber: null,
          plinQRCode: null,
          plinInstructions: 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
          stripeEnabled: true,
          defaultPaymentMethod: 'stripe',
          commissionRate: 0.10,
          updatedBy: user.id
        }
      })
    }

    return createApiSuccessResponse({ settings })

  } catch (error) {
    console.error('Error fetching payment settings:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 403)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}

// PUT /api/admin/payment-settings - Update payment settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    // Only admins can update payment settings
    requireApiRole(user, 'ADMIN')

    const body = await request.json()
    const {
      yapeEnabled,
      yapePhoneNumber,
      yapeInstructions,
      plinEnabled,
      plinPhoneNumber,
      plinInstructions,
      stripeEnabled,
      defaultPaymentMethod,
      commissionRate
    } = body

    // Validate required fields when payment methods are enabled
    if (yapeEnabled && !yapePhoneNumber) {
      return createApiErrorResponse('Yape phone number is required when Yape is enabled', 400)
    }

    if (plinEnabled && !plinPhoneNumber) {
      return createApiErrorResponse('Plin phone number is required when Plin is enabled', 400)
    }

    // Validate commission rate
    if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 1)) {
      return createApiErrorResponse('Commission rate must be between 0 and 1', 400)
    }

    // Validate default payment method
    if (defaultPaymentMethod && !['stripe', 'yape', 'plin'].includes(defaultPaymentMethod)) {
      return createApiErrorResponse('Invalid default payment method', 400)
    }

    // Get existing settings
    let settings = await prisma.paymentSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    const updateData: any = {
      updatedBy: user.id
    }

    // Only update fields that are provided
    if (yapeEnabled !== undefined) updateData.yapeEnabled = yapeEnabled
    if (yapePhoneNumber !== undefined) updateData.yapePhoneNumber = yapePhoneNumber
    if (yapeInstructions !== undefined) updateData.yapeInstructions = yapeInstructions
    if (plinEnabled !== undefined) updateData.plinEnabled = plinEnabled
    if (plinPhoneNumber !== undefined) updateData.plinPhoneNumber = plinPhoneNumber
    if (plinInstructions !== undefined) updateData.plinInstructions = plinInstructions
    if (stripeEnabled !== undefined) updateData.stripeEnabled = stripeEnabled
    if (defaultPaymentMethod !== undefined) updateData.defaultPaymentMethod = defaultPaymentMethod
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate

    if (settings) {
      // Update existing settings
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: updateData
      })
    } else {
      // Create new settings if they don't exist
      settings = await prisma.paymentSettings.create({
        data: {
          ...updateData,
          yapeEnabled: yapeEnabled ?? false,
          plinEnabled: plinEnabled ?? false,
          stripeEnabled: stripeEnabled ?? true,
          defaultPaymentMethod: defaultPaymentMethod ?? 'stripe',
          commissionRate: commissionRate ?? 0.10
        }
      })
    }

    return createApiSuccessResponse({
      message: 'Payment settings updated successfully',
      settings
    })

  } catch (error) {
    console.error('Error updating payment settings:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 403)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}
