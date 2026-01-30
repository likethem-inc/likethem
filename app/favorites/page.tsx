import SavedItems from "@/components/account/SavedItems";

export default function FavoritesPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-serif mb-2">Your Favorites</h1>
        <p className="text-neutral-600 max-w-2xl">
          Save your favorite looks, outfits, and curators here for quick access.
        </p>
      </div>
      <SavedItems />
    </main>
  );
}
