"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/getLocale";

export default function ClientProviders({ 
  children,
  locale
}: { 
  children: React.ReactNode,
  locale: Locale
}) {
  return (
    <SessionProvider>
      <I18nProvider initialLocale={locale}>
        <CartProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </CartProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
