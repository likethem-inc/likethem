import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs'

// GET /api/payment-methods?curatorId=xxx - Get enabled payment methods for a curator (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const curatorId = searchParams.get('curatorId')

    if (!curatorId) {
      return NextResponse.json(
        { error: 'curatorId parameter is required' },
        { status: 400 }
      )
    }

    // Get payment settings for this curator
    const settings = await prisma.paymentSettings.findUnique({
      where: { curatorId }
    })

    // If no settings exist, return no methods (card is disabled by default)
    if (!settings) {
      return NextResponse.json({
        methods: [],
        defaultMethod: null,
        commissionRate: 0.10
      })
    }

    // Build response with enabled payment methods
    const methods: any[] = []

    // Add Yape if enabled
    if (settings.yapeEnabled) {
      methods.push({
        id: 'yape',
        name: 'Yape',
        type: 'yape',
        enabled: true,
        phoneNumber: settings.yapePhoneNumber,
        qrCode: settings.yapeQRCode,
        instructions: settings.yapeInstructions || 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
        icon: 'Smartphone'
      })
    }

    // Add Plin if enabled
    if (settings.plinEnabled) {
      methods.push({
        id: 'plin',
        name: 'Plin',
        type: 'plin',
        enabled: true,
        phoneNumber: settings.plinPhoneNumber,
        qrCode: settings.plinQRCode,
        instructions: settings.plinInstructions || 'Realiza el pago escaneando el código QR o enviando al número de teléfono indicado.',
        icon: 'Smartphone'
      })
    }

    // Add Stripe if enabled
    if (settings.stripeEnabled) {
      methods.push({
        id: 'stripe',
        name: 'Tarjeta de Crédito/Débito',
        type: 'stripe',
        enabled: true,
        icon: 'CreditCard'
      })
    }

    const resolvedDefaultMethod = methods.find(method => method.id === settings.defaultPaymentMethod)?.id
      ?? methods[0]?.id
      ?? null

    return NextResponse.json({
      methods,
      defaultMethod: resolvedDefaultMethod,
      commissionRate: settings.commissionRate || 0.10
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    
    // Return empty configuration on error
    return NextResponse.json({
      methods: [],
      defaultMethod: null,
      commissionRate: 0.10
    }, { status: 200 })
  }
}
