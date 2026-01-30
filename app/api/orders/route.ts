import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient();

// GET - Fetch user's orders (buyer view) or curator's orders (curator view)
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "10");
    const skip = (page - 1) * limit;
    const view = searchParams.get("view"); // 'curator' or default (buyer)

    // Check if user is a curator and requesting curator view
    let whereClause: any = {};
    let includeBuyer = false;
    
    if (view === 'curator') {
      // Find curator profile
      const curatorProfile = await prisma.curatorProfile.findFirst({
        where: { userId: user.id }
      });

      if (!curatorProfile) {
        return NextResponse.json({ 
          error: "Curator profile not found" 
        }, { status: 403 });
      }

      // Return curator's orders
      whereClause = { curatorId: curatorProfile.id };
      includeBuyer = true; // Include buyer info for curator view
    } else {
      // Return buyer's orders
      whereClause = { buyerId: user.id };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip, 
        take: limit,
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
          ...(includeBuyer && {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          })
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      page, 
      limit, 
      total, 
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create new order(s)
export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { 
      items, 
      shippingAddress, 
      paymentMethod,
      transactionCode,
      paymentProof
    } = body;

    // 3. Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required" },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email || 
        !shippingAddress.address || !shippingAddress.city || !shippingAddress.state ||
        !shippingAddress.zipCode || !shippingAddress.country) {
      return NextResponse.json(
        { error: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['stripe', 'yape', 'plin'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // 4. Validate payment method is enabled
    const paymentSettings = await prisma.paymentSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!paymentSettings) {
      return NextResponse.json(
        { error: "Payment settings not configured" },
        { status: 500 }
      );
    }

    // Check if payment method is enabled
    const isPaymentMethodEnabled = 
      (paymentMethod === 'stripe' && paymentSettings.stripeEnabled) ||
      (paymentMethod === 'yape' && paymentSettings.yapeEnabled) ||
      (paymentMethod === 'plin' && paymentSettings.plinEnabled);

    if (!isPaymentMethodEnabled) {
      return NextResponse.json(
        { error: `Payment method '${paymentMethod}' is not enabled` },
        { status: 400 }
      );
    }

    // Validate transaction code for yape/plin
    if ((paymentMethod === 'yape' || paymentMethod === 'plin') && !transactionCode) {
      return NextResponse.json(
        { error: `Transaction code is required for ${paymentMethod} payments` },
        { status: 400 }
      );
    }

    // 5. Validate all products and check stock
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      include: {
        curator: {
          select: {
            id: true,
            storeName: true
          }
        }
      }
    });

    // Check if all products exist
    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Products not found or inactive: ${missingIds.join(', ')}` },
        { status: 404 }
      );
    }

    // Create a map for easy lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate stock for each item
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.title}. Available: ${product.stockQuantity}` },
          { status: 400 }
        );
      }
    }

    // 6. Group items by curator
    const itemsByCurator = new Map<string, typeof items>();
    
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      const curatorId = product.curatorId;
      
      if (!itemsByCurator.has(curatorId)) {
        itemsByCurator.set(curatorId, []);
      }
      itemsByCurator.get(curatorId)!.push({
        ...item,
        product
      });
    }

    // 7. Create orders (one per curator) in a transaction
    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const [curatorId, curatorItems] of Array.from(itemsByCurator.entries())) {
        // Calculate totals for this curator's items
        let subtotal = 0;
        for (const item of curatorItems) {
          const product = item.product;
          subtotal += product.price * item.quantity;
        }

        // Calculate commission
        const commission = subtotal * paymentSettings.commissionRate;
        const curatorAmount = subtotal - commission;

        // Determine order status
        const orderStatus = paymentMethod === 'stripe' 
          ? 'PENDING' 
          : 'PENDING_VERIFICATION';

        // Create order
        const order = await tx.order.create({
          data: {
            buyerId: user.id!,
            curatorId: curatorId,
            status: orderStatus,
            totalAmount: subtotal,
            commission: commission,
            curatorAmount: curatorAmount,
            paymentMethod: paymentMethod,
            transactionCode: transactionCode || null,
            paymentProof: paymentProof || null,
            items: {
              create: curatorItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                size: item.size || null,
                color: item.color || null
              }))
            },
            shippingAddress: {
              create: {
                name: shippingAddress.name,
                email: shippingAddress.email,
                phone: shippingAddress.phone || null,
                address: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state,
                zipCode: shippingAddress.zipCode,
                country: shippingAddress.country
              }
            }
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
              }
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

        // Update product stock
        for (const item of curatorItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity
              }
            }
          });
        }

        orders.push(order);
      }

      return orders;
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      orders: createdOrders,
      message: `${createdOrders.length} order(s) created successfully`
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}