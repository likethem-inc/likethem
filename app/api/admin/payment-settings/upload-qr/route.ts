import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { uploadToSupabase } from '@/lib/storage'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs'

// POST /api/admin/payment-settings/upload-qr - Upload QR code image (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized', 401)
    }

    // Only admins can upload QR codes
    requireApiRole(user, 'ADMIN')

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing')
      return createApiErrorResponse('Image upload service not configured', 500)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const paymentMethod = formData.get('paymentMethod') as string

    // Validate inputs
    if (!file) {
      return createApiErrorResponse('No file provided', 400)
    }

    if (!paymentMethod) {
      return createApiErrorResponse('Payment method is required', 400)
    }

    // Validate payment method
    if (!['yape', 'plin'].includes(paymentMethod)) {
      return createApiErrorResponse('Invalid payment method. Must be "yape" or "plin"', 400)
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return createApiErrorResponse('File is too large. Maximum size is 5MB', 400)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return createApiErrorResponse('File must be an image', 400)
    }

    // Upload to Supabase Storage in the 'qrs' folder
    const uploadResult = await uploadToSupabase(file, 'qrs')

    // Get or create payment settings
    let settings = await prisma.paymentSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Update payment settings with the new QR code URL
    const updateData: any = {
      updatedBy: user.id
    }

    if (paymentMethod === 'yape') {
      updateData.yapeQRCode = uploadResult.url
    } else if (paymentMethod === 'plin') {
      updateData.plinQRCode = uploadResult.url
    }

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
          yapeEnabled: false,
          plinEnabled: false,
          stripeEnabled: true,
          defaultPaymentMethod: 'stripe',
          commissionRate: 0.10,
          updatedBy: user.id
        }
      })
    }

    return createApiSuccessResponse({
      message: 'QR code uploaded successfully',
      url: uploadResult.url,
      paymentMethod,
      settings
    })

  } catch (error) {
    console.error('Error uploading QR code:', error)
    if (error instanceof Error) {
      // Check if it's an authentication error
      if (error.message.includes('Access denied') || error.message.includes('Required role')) {
        return createApiErrorResponse(error.message, 403)
      }
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to upload QR code', 500)
  }
}
