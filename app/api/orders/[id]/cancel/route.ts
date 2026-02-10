import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user is the buyer of this order
    if (order.buyerId !== user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own orders" },
        { status: 403 }
      );
    }

    // Check if order can be cancelled (not yet shipped)
    if (order.status === 'SHIPPED' || order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: `Cannot cancel order with status ${order.status}` },
        { status: 400 }
      );
    }

    // Restore stock for cancelled order
    for (const item of order.items) {
      if (item.size && item.color) {
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

    // Update order status to CANCELLED
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      },
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
        }
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
