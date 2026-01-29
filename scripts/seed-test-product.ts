import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting test product creation...');

  // Find or create a curator
  let curator = await prisma.curatorProfile.findFirst({
    where: { slug: 'carlos-s-store' }
  });

  if (!curator) {
    // Create a test user first
    let user = await prisma.user.findFirst({
      where: { email: 'carlos@test.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'carlos@test.com',
          name: 'Carlos',
          emailVerified: new Date(),
        }
      });
      console.log('Created test user:', user.email);
    }

    // Create curator profile
    curator = await prisma.curatorProfile.create({
      data: {
        userId: user.id,
        slug: 'carlos-s-store',
        storeName: 'Tienda de Carlos',
        bio: 'Fashion curator and style expert',
        isPublic: true,
      }
    });
    console.log('Created curator:', curator.storeName);
  }

  // Check if product already exists
  let product = await prisma.product.findUnique({
    where: { slug: 'saco-crema' }
  });

  if (product) {
    console.log('Product already exists, updating...');
    product = await prisma.product.update({
      where: { slug: 'saco-crema' },
      data: {
        sizes: 'XS, S, M, L, XL',
        colors: 'Navy, Crema, Negro',
        isActive: true,
      }
    });
  } else {
    // Create test product with sizes and colors
    product = await prisma.product.create({
      data: {
        curatorId: curator.id,
        slug: 'saco-crema',
        title: 'Saco Crema',
        description: 'Lo use en la fiesta de fin de año.',
        price: 40.00,
        category: 'Outerwear',
        tags: 'jacket, blazer, formal',
        sizes: 'XS, S, M, L, XL',
        colors: 'Navy, Crema, Negro',
        stockQuantity: 1,
        isActive: true,
        curatorNote: 'One-of-a-kind piece from my personal collection',
      }
    });
    console.log('Created product:', product.title);

    // Add a product image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800',
        altText: 'Saco Crema',
        order: 0,
      }
    });
    console.log('Added product image');
  }

  console.log('✅ Test product created successfully!');
  console.log(`Visit: http://localhost:3000/curator/${curator.slug}/product/${product.slug}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
