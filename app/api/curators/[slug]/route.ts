import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

const toPublicUrl = (path?: string | null) => {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  if (path.startsWith('/')) return path
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return path
  return `${base}/storage/v1/object/public/likethem-assets/${path}`
}

// GET /api/curators/[slug] - Get curator profile and products (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Decode the URL parameter to handle %20 and other encoded characters
    const decodedSlug = decodeURIComponent(params.slug)
    console.log('Looking for curator with slug:', decodedSlug)

    // Find curator by slug
    const curator = await prisma.curatorProfile.findUnique({
      where: { slug: decodedSlug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        products: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!curator) {
      console.log('Curator not found')
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    // Only return public curators
    if (!curator.isPublic) {
      console.log('Curator is not public')
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    console.log('Found curator:', curator.storeName, 'with', curator.products.length, 'products')

    return NextResponse.json({
      curator: {
        id: curator.id,
        storeName: curator.storeName,
        bio: curator.bio,
        avatarImage: toPublicUrl(curator.avatarImage) || curator.user.image || null,
        bannerImage: toPublicUrl(curator.bannerImage),
        instagram: curator.instagram,
        tiktok: curator.tiktok,
        youtube: curator.youtube,
        twitter: curator.twitter,
        isEditorsPick: curator.isEditorsPick,
        slug: curator.slug,
        user: curator.user,
        products: curator.products.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          tags: product.tags,
          sizes: product.sizes,
          colors: product.colors,
          stockQuantity: product.stockQuantity,
          curatorNote: product.curatorNote,
          slug: product.slug,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          images: product.images.map(image => ({
            ...image,
            url: toPublicUrl(image.url)
          }))
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching curator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 