import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiAuth, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'
import { checkVariantAvailability } from '@/lib/inventory/variants'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET - Fetch user's cart items
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can access their cart)
    requireApiAuth(user)

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc'
              }
            },
            curator: {
              select: {
                storeName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend CartItem interface and check stock
    const transformedItems = await Promise.all(
      cartItems.map(async (item) => {
        let availableStock = item.product.stockQuantity
        let isOutOfStock = false

        // Check variant stock if size and color are specified
        if (item.size && item.color) {
          const variantAvailability = await checkVariantAvailability(
            item.productId,
            item.size,
            item.color,
            item.quantity
          )
          availableStock = variantAvailability.stockQuantity
          isOutOfStock = !variantAvailability.available
        }

        return {
          id: item.id,
          name: item.product.title,
          curator: item.product.curator.storeName,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0]?.url || '',
          size: item.size,
          color: item.color,
          productId: item.productId,
          availableStock,
          isOutOfStock
        }
      })
    )

    return createApiSuccessResponse({ items: transformedItems })

  } catch (error) {
    console.error('Error fetching cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 403)
    }
    return createApiErrorResponse('Failed to fetch cart', 500)
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can add to cart)
    requireApiAuth(user)

    const body = await request.json()
    const { productId, quantity = 1, size, color } = body

    if (!productId) {
      return createApiErrorResponse('Product ID is required', 400)
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        curator: {
          select: {
            storeName: true
          }
        }
      }
    })

    if (!product) {
      return createApiErrorResponse('Product not found', 404)
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId: productId,
        size: size || null,
        color: color || null
      }
    })

    // Check variant stock availability
    if (size && color) {
      const requestedQuantity = existingItem ? existingItem.quantity + quantity : quantity
      const variantAvailability = await checkVariantAvailability(
        productId,
        size,
        color,
        requestedQuantity
      )

      if (!variantAvailability.available) {
        return createApiErrorResponse(
          `Insufficient stock. Only ${variantAvailability.stockQuantity} items available.`,
          400
        )
      }
    }

    let cartItem

    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  order: 'asc'
                }
              },
              curator: {
                select: {
                  storeName: true
                }
              }
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          size: size || null,
          color: color || null
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  order: 'asc'
                }
              },
              curator: {
                select: {
                  storeName: true
                }
              }
            }
          }
        }
      })
    }

    // Transform the response
    const transformedItem = {
      id: cartItem.id,
      name: cartItem.product.title,
      curator: cartItem.product.curator.storeName,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      image: cartItem.product.images[0]?.url || '',
      size: cartItem.size,
      color: cartItem.color,
      productId: cartItem.productId
    }

    return createApiSuccessResponse({
      success: true,
      item: transformedItem,
      message: 'Item added to cart'
    })

  } catch (error) {
    console.error('Error adding to cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to add item to cart', 500)
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can update their cart)
    requireApiAuth(user)

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return createApiErrorResponse('Item ID and quantity are required', 400)
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: {
          id: itemId,
          userId: user.id // Ensure user owns the item
        }
      })

      return createApiSuccessResponse({
        success: true,
        message: 'Item removed from cart'
      })
    }

    // Get the cart item to check size and color
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        id: itemId,
        userId: user.id
      },
      include: {
        product: true
      }
    })

    if (!existingCartItem) {
      return createApiErrorResponse('Cart item not found', 404)
    }

    // Check variant stock availability
    if (existingCartItem.size && existingCartItem.color) {
      const variantAvailability = await checkVariantAvailability(
        existingCartItem.productId,
        existingCartItem.size,
        existingCartItem.color,
        quantity
      )

      if (!variantAvailability.available) {
        return createApiErrorResponse(
          `Insufficient stock. Only ${variantAvailability.stockQuantity} items available.`,
          400
        )
      }
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        id: itemId,
        userId: user.id // Ensure user owns the item
      },
      data: { quantity },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc'
              }
            },
            curator: {
              select: {
                storeName: true
              }
            }
          }
        }
      }
    })

    const transformedItem = {
      id: cartItem.id,
      name: cartItem.product.title,
      curator: cartItem.product.curator.storeName,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      image: cartItem.product.images[0]?.url || '',
      size: cartItem.size,
      color: cartItem.color,
      productId: cartItem.productId
    }

    return createApiSuccessResponse({
      success: true,
      item: transformedItem,
      message: 'Cart updated'
    })

  } catch (error) {
    console.error('Error updating cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to update cart', 500)
  }
}

// DELETE - Remove item from cart or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can remove from cart)
    requireApiAuth(user)

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (itemId) {
      await prisma.cartItem.delete({
        where: {
          id: itemId,
          userId: user.id // Ensure user owns the item
        }
      })

      return createApiSuccessResponse({
        success: true,
        message: 'Item removed from cart'
      })
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id
      }
    })

    return createApiSuccessResponse({
      success: true,
      message: 'Cart cleared'
    })

  } catch (error) {
    console.error('Error removing from cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to remove item from cart', 500)
  }
} 