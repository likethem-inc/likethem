import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs';

const prisma = new PrismaClient()

// DELETE /api/curator/store/delete - Delete curator store
export async function DELETE(request: NextRequest) {
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

    if (ordersCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete store with existing orders',
          ordersCount 
        },
        { status: 400 }
      )
    }

    // Check for active collaborations
    const collaborationsCount = await prisma.collaboration.count({
      where: {
        OR: [
          { curator1Id: curatorProfile.id },
          { curator2Id: curatorProfile.id }
        ]
      }
    })

    if (collaborationsCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete store with active collaborations',
          collaborationsCount 
        },
        { status: 400 }
      )
    }

    // Perform deletion in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete curator profile (this will cascade delete products, follows, collaboration requests, payment settings)
      await tx.curatorProfile.delete({
        where: { id: curatorProfile.id }
      })

      // Update user role back to BUYER
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: 'BUYER' }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Store deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting store:', error)
    return NextResponse.json(
      { error: 'Failed to delete store' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
