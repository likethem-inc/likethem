import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/curator/store/check-deletion - Check if store can be deleted
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!curatorProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    // Check for orders
    const ordersCount = await prisma.order.count({
      where: { curatorId: curatorProfile.id }
    })

    // Check for active collaborations
    const collaborationsCount = await prisma.collaboration.count({
      where: {
        OR: [
          { curator1Id: curatorProfile.id },
          { curator2Id: curatorProfile.id }
        ]
      }
    })

    // Count products
    const productsCount = await prisma.product.count({
      where: { curatorId: curatorProfile.id }
    })

    // Count followers
    const followersCount = await prisma.follow.count({
      where: { curatorId: curatorProfile.id }
    })

    // Store can be deleted if there are no orders and no active collaborations
    const canDelete = ordersCount === 0 && collaborationsCount === 0

    return NextResponse.json({
      canDelete,
      ordersCount,
      collaborationsCount,
      productsCount,
      followersCount,
      blockers: {
        hasOrders: ordersCount > 0,
        hasCollaborations: collaborationsCount > 0
      }
    })

  } catch (error) {
    console.error('Error checking store deletion:', error)
    return NextResponse.json(
      { error: 'Failed to check store deletion status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
