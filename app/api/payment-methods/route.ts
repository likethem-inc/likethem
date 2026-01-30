import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs'

// GET /api/payment-methods - Get enabled payment methods (public)
export async function GET(request: NextRequest) {
  try {
    // Get payment settings
    const settings = await prisma.paymentSettings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // If no settings exist, return default configuration
    if (!settings) {
      return NextResponse.json({
        methods: [
          {
            id: 'stripe',
            name: 'Tarjeta de Crédito/Débito',
            type: 'stripe',
            enabled: true,
            icon: 'CreditCard'
          }
        ],
        defaultMethod: 'stripe'
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

    // If no methods are enabled, return Stripe as default
    if (methods.length === 0) {
      methods.push({
        id: 'stripe',
        name: 'Tarjeta de Crédito/Débito',
        type: 'stripe',
        enabled: true,
        icon: 'CreditCard'
      })
    }

    return NextResponse.json({
      methods,
      defaultMethod: settings.defaultPaymentMethod || 'stripe',
      commissionRate: settings.commissionRate || 0.10
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    
    // Return default configuration on error
    return NextResponse.json({
      methods: [
        {
          id: 'stripe',
          name: 'Tarjeta de Crédito/Débito',
          type: 'stripe',
          enabled: true,
          icon: 'CreditCard'
        }
      ],
      defaultMethod: 'stripe',
      commissionRate: 0.10
    }, { status: 200 })
  }
}
