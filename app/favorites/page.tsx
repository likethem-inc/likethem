import SavedItems from "@/components/account/SavedItems";
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export default async function FavoritesPage() {
  const locale = await getLocale()
  
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">{t(locale, 'favorites.title')}</h1>
        <p className="text-neutral-600 max-w-2xl">
          {t(locale, 'favorites.subtitle')}
        </p>
      </div>
      <SavedItems />
    </main>
  );
}
