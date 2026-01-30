import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/curator/payment-settings - Fetch curator's payment settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!curatorProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    // Get or create payment settings
    let settings = await prisma.paymentSettings.findUnique({
      where: { curatorId: curatorProfile.id }
    })

    if (!settings) {
      // Create default settings for this curator
      settings = await prisma.paymentSettings.create({
        data: {
          curatorId: curatorProfile.id,
          yapeEnabled: false,
          plinEnabled: false,
          stripeEnabled: true,
          defaultPaymentMethod: 'stripe',
          commissionRate: 0.10,
          updatedBy: session.user.id
        }
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[curator/payment-settings] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// PUT /api/curator/payment-settings - Update curator's payment settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Login required' },
        { status: 401 }
      )
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!curatorProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    const body = await req.json()

    // Validate input
    const allowedFields = [
      'yapeEnabled',
      'yapePhoneNumber',
      'yapeQRCode',
      'yapeInstructions',
      'plinEnabled',
      'plinPhoneNumber',
      'plinQRCode',
      'plinInstructions',
      'stripeEnabled',
      'stripePublicKey',
      'stripeSecretKey',
      'defaultPaymentMethod',
      'commissionRate'
    ]

    const updateData: any = {
      updatedBy: session.user.id
    }

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Update or create settings
    const settings = await prisma.paymentSettings.upsert({
      where: { curatorId: curatorProfile.id },
      update: updateData,
      create: {
        curatorId: curatorProfile.id,
        ...updateData
      }
    })

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('[curator/payment-settings] PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
