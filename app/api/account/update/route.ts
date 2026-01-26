import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone } = body

    // Validate input
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (phone && typeof phone !== 'string') {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phone: true,
        role: true,
      }
    })

    console.log('[account] User updated:', { userId: session.user.id, name, phone })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })

  } catch (error) {
    console.error('[account] Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
