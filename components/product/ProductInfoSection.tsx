"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import AddToCartButton from "@/components/cart/AddToCartButton";
import WishlistButton from "@/components/product/WishlistButton";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import ProductVariantSelector from "@/components/product/ProductVariantSelector";
import { CuratorImageWithFallback } from "@/components/ImageWithFallback";
import { useT } from "@/hooks/useT";

type Props = {
  product: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    price: number;
    isActive: boolean;
    stockQuantity: number;
    sizes: string[];
    colors: string[];
    images: Array<{ id: string; url: string; order: number }>;
    curator: {
      id: string;
      slug: string;
      storeName: string;
      avatar: string | null;
    };
  };
};

export default function ProductInfoSection({ product }: Props) {
  const t = useT();
  // Initialize selected size and color with the first available option
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.length > 0 ? product.colors[0] : undefined
  );

  // Check if product has any stock
  const hasStock = product.stockQuantity > 0 && (product.sizes.length > 0 || product.colors.length > 0);
  const isOutOfStock = product.stockQuantity === 0 || (product.sizes.length === 0 && product.colors.length === 0);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-neutral-900">{product.title}</h1>
        <Link
          href={`/curator/${product.curator.slug}`}
          className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <div className="relative h-6 w-6 overflow-hidden rounded-full bg-neutral-200">
            <CuratorImageWithFallback
              src={product.curator.avatar}
              alt={product.curator.storeName}
              size="avatar"
              width={24}
              height={24}
              className="h-6 w-6 object-cover"
            />
          </div>
          {product.curator.storeName}
        </Link>
      </div>

      {/* Price */}
      <div className="flex items-center gap-4">
        <div className="text-xl text-neutral-900">
          ${product.price.toFixed(2)}
        </div>
      </div>

      {/* Description (short) */}
      <p className="text-sm leading-6 text-neutral-600">{product.description}</p>

      {/* Out of Stock Message */}
      {isOutOfStock && (
        <div className="rounded-lg bg-neutral-100 p-4 text-center">
          <p className="text-sm font-medium text-neutral-700">{t('product.outOfStock')}</p>
          <p className="mt-1 text-xs text-neutral-500">Este producto no tiene stock disponible en este momento.</p>
        </div>
      )}

      {/* Product Variant Selector - Only show if has stock */}
      {hasStock && (
        <ProductVariantSelector
          sizes={product.sizes}
          colors={product.colors}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          onSizeChange={setSelectedSize}
          onColorChange={setSelectedColor}
          sizeLabel={t('product.size')}
          colorLabel={t('product.color')}
        />
      )}

      {/* Product Clarity Note */}
      {hasStock && (
        <div className="pt-2 border-t border-neutral-200">
          <p className="text-xs text-neutral-600 leading-relaxed">
            {t('product.oneOfAKind')}
            <span className="text-neutral-500"> {t('product.onlyOneAvailable')}</span>
          </p>
        </div>
      )}

      {/* Purchase */}
      <div className="space-y-4">
        {/* Authenticity Badge */}
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <CheckCircle2 className="h-4 w-4 text-neutral-500" />
          <span>{t('product.verified')}</span>
        </div>

        <div className="flex items-center gap-3">
          <AddToCartButton
            productId={product.id}
            productTitle={product.title}
            productPrice={product.price}
            productImage={product.images[0]?.url || ''}
            curatorName={product.curator.storeName}
            size={selectedSize}
            color={selectedColor}
            disabled={!product.isActive || isOutOfStock}
            className="flex-1 rounded-xl bg-black px-5 py-3 text-sm text-white hover:bg-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-200"
          >
            {isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}
          </AddToCartButton>
          <WishlistButton
            productSlug={product.slug}
            curatorSlug={product.curator.slug}
            variant="icon-only"
          />
        </div>

        {/* Shipping & Returns - Collapsible */}
        <CollapsibleSection title={t('product.shippingReturns')}>
          <div className="space-y-3">
            <div>
              <p className="font-medium text-neutral-900 mb-1">{t('product.shipping')}</p>
              <p className="text-neutral-600">
                {t('product.shippingDesc')}
              </p>
            </div>
            <div>
              <p className="font-medium text-neutral-900 mb-1">{t('product.returns')}</p>
              <p className="text-neutral-600">
                {t('product.returnsDesc')}
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Subtle meta */}
      <div className="pt-4 text-xs text-neutral-400">
        SKU: {product.slug.toUpperCase()} • Curated by {product.curator.storeName}
      </div>
    </section>
  );
}
