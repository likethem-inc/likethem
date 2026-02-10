import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              select: { 
                id: true, 
                title: true, 
                images: {
                  select: { url: true, altText: true },
                  take: 1,
                  orderBy: { order: 'asc' }
                }
              } 
            } 
          },
        },
        shippingAddress: true,
        curator: {
          select: {
            id: true,
            storeName: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
    });

    if (!order || order.buyerId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Parse request body
    const body = await req.json();
    const { status, courier, trackingNumber, estimatedDeliveryDate } = body;

    // Validate status
    const validStatuses = [
      'PENDING_PAYMENT',
      'PAID',
      'REJECTED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'FAILED_ATTEMPT',
      'CANCELLED',
      'REFUNDED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        curator: {
          select: {
            id: true,
            userId: true
          }
        },
        items: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user is the curator of this order
    if (order.curator.userId !== user.id) {
      return NextResponse.json(
        { error: "Only the curator can update this order" },
        { status: 403 }
      );
    }

    // Status transition validation
    const currentStatus = order.status;
    const isValidTransition = validateStatusTransition(currentStatus, status);
    
    if (!isValidTransition) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Add shipping information if transitioning to SHIPPED
    if (status === 'SHIPPED') {
      if (courier) updateData.courier = courier;
      if (trackingNumber) updateData.trackingNumber = trackingNumber;
      if (estimatedDeliveryDate) updateData.estimatedDeliveryDate = new Date(estimatedDeliveryDate);
    }

    // Handle stock restoration for CANCELLED and REJECTED orders
    if ((status === 'CANCELLED' || status === 'REJECTED') && 
        (currentStatus !== 'CANCELLED' && currentStatus !== 'REJECTED')) {
      await restoreStock(order.items);
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: { 
                id: true, 
                title: true, 
                images: {
                  select: { url: true, altText: true },
                  take: 1,
                  orderBy: { order: 'asc' }
                }
              } 
            } 
          },
        },
        shippingAddress: true,
        curator: {
          select: {
            id: true,
            storeName: true
          }
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to validate status transitions
function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  // Define allowed transitions
  const transitions: Record<string, string[]> = {
    'PENDING_PAYMENT': ['PAID', 'REJECTED', 'CANCELLED'],
    'PAID': ['PROCESSING', 'REFUNDED', 'CANCELLED'],
    'REJECTED': ['REFUNDED'],
    'PROCESSING': ['SHIPPED', 'CANCELLED'],
    'SHIPPED': ['DELIVERED', 'FAILED_ATTEMPT'],
    'FAILED_ATTEMPT': ['SHIPPED', 'DELIVERED', 'CANCELLED'],
    'DELIVERED': [],
    'CANCELLED': ['REFUNDED'],
    'REFUNDED': []
  };

  // If same status, allow (no actual change)
  if (currentStatus === newStatus) return true;

  // Check if transition is allowed
  return transitions[currentStatus]?.includes(newStatus) || false;
}

// Helper function to restore stock for cancelled/rejected orders
async function restoreStock(items: any[]): Promise<void> {
  for (const item of items) {
    if (item.size && item.color) {
      // Restore variant stock
      await prisma.productVariant.update({
        where: {
          productId_size_color: {
            productId: item.productId,
            size: item.size,
            color: item.color
          }
        },
        data: {
          stockQuantity: { increment: item.quantity }
        }
      });
    }
  }
}
