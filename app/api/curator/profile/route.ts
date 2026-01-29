import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSlugFromStoreName } from '@/lib/slug'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/curator/profile - Get current user's curator profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    if (!curatorProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    // Transform the curator profile data to handle null values
    const transformedCuratorProfile = {
      ...curatorProfile,
      bio: curatorProfile.bio ?? undefined,
      avatarImage: curatorProfile.avatarImage || curatorProfile.user.image || undefined,
      bannerImage: curatorProfile.bannerImage || undefined,
      instagram: curatorProfile.instagram || undefined,
      tiktok: curatorProfile.tiktok || undefined,
      youtube: curatorProfile.youtube || undefined,
      twitter: curatorProfile.twitter || undefined,
      user: {
        ...curatorProfile.user,
        name: curatorProfile.user.name ?? undefined,
        image: curatorProfile.user.image ?? undefined,
      }
    }

    return NextResponse.json({ curatorProfile: transformedCuratorProfile })
  } catch (error) {
    console.error('Error fetching curator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/curator/profile - Create a new curator profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { storeName, bio, instagram, tiktok, avatarImage, bannerImage } = await request.json()

    // Validation
    if (!storeName?.trim()) {
      return NextResponse.json(
        { error: 'Store name is required' },
        { status: 400 }
      )
    }

    if (!bio?.trim()) {
      return NextResponse.json(
        { error: 'Bio is required' },
        { status: 400 }
      )
    }

    // Check if user already has a curator profile
    const existingProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User already has a curator profile' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const baseSlug = generateSlugFromStoreName(storeName.trim())
    
    // Get all existing slugs to check for uniqueness
    const existingCurators = await prisma.curatorProfile.findMany({
      select: { slug: true }
    })
    const existingSlugs = existingCurators.map(c => c.slug).filter(Boolean)
    
    const uniqueSlug = await generateSlugFromStoreName(storeName.trim(), existingSlugs)

    // Create curator profile
    const curatorProfile = await prisma.curatorProfile.create({
      data: {
        userId: session.user.id,
        storeName: storeName.trim(),
        slug: uniqueSlug,
        bio: bio.trim(),
        avatarImage: avatarImage || null,
        instagram: instagram?.trim() || null,
        tiktok: tiktok?.trim() || null,
        bannerImage: bannerImage || null,
        isPublic: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Update user role to CURATOR
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'CURATOR' }
    })

    // Transform the curator profile data to handle null values
    const transformedCuratorProfile = {
      ...curatorProfile,
      bio: curatorProfile.bio ?? undefined,
      bannerImage: curatorProfile.bannerImage ?? undefined,
      instagram: curatorProfile.instagram ?? undefined,
      tiktok: curatorProfile.tiktok ?? undefined,
      youtube: curatorProfile.youtube ?? undefined,
      twitter: curatorProfile.twitter ?? undefined,
      user: {
        ...curatorProfile.user,
        name: curatorProfile.user.name ?? undefined,
        image: curatorProfile.user.image ?? undefined,
      }
    }

    return NextResponse.json(
      { 
        message: 'Curator profile created successfully',
        curatorProfile: transformedCuratorProfile
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating curator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/curator/profile - Update current user's curator profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has a curator profile
    const existingProfile = await prisma.curatorProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { 
      storeName, 
      bio, 
      city,
      styleTags,
      avatarImage,
      bannerImage,
      instagram, 
      tiktok, 
      youtube, 
      twitter,
      websiteUrl,
      isPublic,
      notifyFollowers,
      notifyFavorites,
      notifyCollaborations,
      notifyOrders,
      showSales,
      showEarnings,
      allowCollaborations
    } = body

    // Prepare update data
    const updateData: any = {}

    if (storeName !== undefined) {
      if (!storeName?.trim()) {
        return NextResponse.json(
          { error: 'Store name cannot be empty' },
          { status: 400 }
        )
      }
      updateData.storeName = storeName.trim()
    }

    if (bio !== undefined) {
      updateData.bio = bio?.trim() || null
    }

    if (city !== undefined) {
      updateData.city = city?.trim() || null
    }

    if (styleTags !== undefined) {
      updateData.styleTags = styleTags
    }

    if (avatarImage !== undefined) {
      updateData.avatarImage = avatarImage || null
    }

    if (bannerImage !== undefined) {
      updateData.bannerImage = bannerImage || null
    }

    if (instagram !== undefined) {
      updateData.instagram = instagram?.trim() || null
    }

    if (tiktok !== undefined) {
      updateData.tiktok = tiktok?.trim() || null
    }

    if (youtube !== undefined) {
      updateData.youtube = youtube?.trim() || null
    }

    if (twitter !== undefined) {
      updateData.twitter = twitter?.trim() || null
    }

    if (websiteUrl !== undefined) {
      updateData.websiteUrl = websiteUrl?.trim() || null
    }

    if (isPublic !== undefined) {
      updateData.isPublic = Boolean(isPublic)
    }

    if (notifyFollowers !== undefined) updateData.notifyFollowers = Boolean(notifyFollowers)
    if (notifyFavorites !== undefined) updateData.notifyFavorites = Boolean(notifyFavorites)
    if (notifyCollaborations !== undefined) updateData.notifyCollaborations = Boolean(notifyCollaborations)
    if (notifyOrders !== undefined) updateData.notifyOrders = Boolean(notifyOrders)
    if (showSales !== undefined) updateData.showSales = Boolean(showSales)
    if (showEarnings !== undefined) updateData.showEarnings = Boolean(showEarnings)
    if (allowCollaborations !== undefined) updateData.allowCollaborations = Boolean(allowCollaborations)

    // Update curator profile
    const updatedProfile = await prisma.curatorProfile.update({
      where: { userId: session.user.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Transform the curator profile data to handle null values
    const transformedProfile = {
      ...updatedProfile,
      bio: updatedProfile.bio ?? undefined,
      avatarImage: updatedProfile.avatarImage || updatedProfile.user.image || undefined,
      bannerImage: updatedProfile.bannerImage ?? undefined,
      instagram: updatedProfile.instagram ?? undefined,
      tiktok: updatedProfile.tiktok ?? undefined,
      youtube: updatedProfile.youtube ?? undefined,
      twitter: updatedProfile.twitter ?? undefined,
      websiteUrl: updatedProfile.websiteUrl ?? undefined,
      city: updatedProfile.city ?? undefined,
      user: {
        ...updatedProfile.user,
        name: updatedProfile.user.name ?? undefined,
        image: updatedProfile.user.image ?? undefined,
      }
    }

    return NextResponse.json({
      message: 'Curator profile updated successfully',
      curatorProfile: transformedProfile
    })

  } catch (error) {
    console.error('Error updating curator profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
