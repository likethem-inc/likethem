import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all addresses for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.userAddress.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ addresses })

  } catch (error) {
    console.error('[addresses] Fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address, city, state, zipCode, country, isDefault } = body

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If this address is being set as default, unset all other defaults
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    const newAddress = await prisma.userAddress.create({
      data: {
        userId: session.user.id,
        name,
        phone: phone || null,
        address,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false
      }
    })

    console.log('[addresses] Address created:', { userId: session.user.id, addressId: newAddress.id })

    return NextResponse.json({ 
      success: true, 
      address: newAddress 
    })

  } catch (error) {
    console.error('[addresses] Create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update an existing address
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, phone, address, city, state, zipCode, country, isDefault } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Verify that the address belongs to the current user
    const existingAddress = await prisma.userAddress.findFirst({
      where: { 
        id,
        userId: session.user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If this address is being set as default, unset all other defaults
    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      })
    }

    const updatedAddress = await prisma.userAddress.update({
      where: { id },
      data: {
        name,
        phone: phone || null,
        address,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false
      }
    })

    console.log('[addresses] Address updated:', { userId: session.user.id, addressId: id })

    return NextResponse.json({ 
      success: true, 
      address: updatedAddress 
    })

  } catch (error) {
    console.error('[addresses] Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete an address
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    // Verify that the address belongs to the current user
    const existingAddress = await prisma.userAddress.findFirst({
      where: { 
        id,
        userId: session.user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    await prisma.userAddress.delete({
      where: { id }
    })

    console.log('[addresses] Address deleted:', { userId: session.user.id, addressId: id })

    return NextResponse.json({ 
      success: true,
      message: 'Address deleted successfully' 
    })

  } catch (error) {
    console.error('[addresses] Delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
