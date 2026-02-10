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
    const { status } = body;

    // Validate status
    const validStatuses = [
      'PENDING',
      'PENDING_VERIFICATION',
      'PENDING_PAYMENT',
      'PAID',
      'REJECTED',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
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
        }
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

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { 
        status,
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
