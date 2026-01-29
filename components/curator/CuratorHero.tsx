'use client';

import Link from "next/link";
import Image from "next/image";
import ShareButton from "../ShareButton";
import clsx from "clsx";
import { safeSrc } from "@/lib/img";
import { CuratorImageWithFallback } from "@/components/ImageWithFallback";
import { useT } from "@/hooks/useT";
import { Instagram, Music2, Youtube, Globe, ExternalLink } from "lucide-react";
import FollowButton from "@/components/curator/FollowButton";

type Curator = {
  id: string;
  storeName: string | null;
  bio: string | null;
  city?: string | null;
  country?: string | null;
  styleTags?: string[] | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  websiteUrl?: string | null;
  bannerImage: string | null;
  isEditorsPick: boolean | null;
  slug: string | null;
  avatarUrl?: string | null; // optional (users.image or null)
};

export default function CuratorHero({ curator }: { curator: Curator }) {
  const t = useT();

  // Parse style tags if they're a JSON string
  let styleTags: string[] = []
  if (curator.styleTags) {
    if (Array.isArray(curator.styleTags)) {
      styleTags = curator.styleTags
    } else if (typeof curator.styleTags === 'string') {
      try {
        const parsed = JSON.parse(curator.styleTags)
        if (Array.isArray(parsed)) {
          styleTags = parsed
        }
      } catch {
        // Not JSON, ignore
      }
    }
  }

  // Text theme: favor light text due to dark scrim at the bottom
  const textClass = 'text-white';
  const subtitleClass = 'text-white/90';
  const statsClass = 'text-white/70';

  const hasLocation = curator.city || curator.country
  const hasSocials = curator.instagramUrl || curator.tiktokUrl || curator.youtubeUrl || curator.websiteUrl
  const hasTags = styleTags.length > 0

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 min-h-[14rem] md:min-h-[18.5rem] flex flex-col justify-end group">
      {/* Cover */}
      <div className="absolute inset-0 z-0 bg-zinc-900" data-build="curator-banner-fallback-v1">
        <CuratorImageWithFallback
          src={curator.bannerImage ?? null}
          alt={`${curator.storeName ?? "Curator"} banner`}
          size="banner"
          fill
          priority={true}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="100vw"
        />

        {/* Scrim: Multi-layered for maximum readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
      </div>

      {/* Header content */}
      <div className="relative z-10 px-5 pb-8 md:px-10 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-xl bg-gray-100 md:h-28 md:w-28 relative flex-shrink-0" data-build="curator-avatar-fallback-v1">
            <CuratorImageWithFallback
              src={curator.avatarUrl ?? null}
              alt={`${curator.storeName ?? "Curator"} avatar`}
              size="avatar"
              width={144}
              height={144}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={clsx(
                'truncate text-2xl font-bold tracking-tight md:text-3xl [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]',
                textClass
              )}>
                {curator.storeName ?? "Curator's Closet"}
              </h1>
              {curator.isEditorsPick ? (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm uppercase tracking-wider">
                  {t('explore.editorsPick')}
                </span>
              ) : null}
            </div>
            
            {/* Bio */}
            {curator.bio && (
              <p className={clsx('mt-3 max-w-2xl text-sm font-medium leading-snug drop-shadow-md', subtitleClass)}>
                {curator.bio}
              </p>
            )}

            {/* Meta row: Location + Socials */}
            {(hasLocation || hasSocials) && (
              <div className={clsx('mt-4 flex items-center gap-5 text-sm flex-wrap font-medium', statsClass)}>
                {/* Location */}
                {hasLocation && (
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span>
                      {curator.city && curator.country
                        ? t('curator.location.cityCountry', { city: curator.city, country: curator.country })
                        : curator.city || curator.country
                      }
                    </span>
                  </div>
                )}

                {hasSocials && hasLocation && <span className="opacity-40">|</span>}

                {/* Social Links */}
                {hasSocials && (
                  <div className="flex items-center gap-4">
                    {curator.instagramUrl && (
                      <a
                        href={curator.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform p-1"
                        aria-label={t('curator.social.instagram')}
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {curator.tiktokUrl && (
                      <a
                        href={curator.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform p-1"
                        aria-label={t('curator.social.tiktok')}
                      >
                        <Music2 className="h-5 w-5" />
                      </a>
                    )}
                    {curator.youtubeUrl && (
                      <a
                        href={curator.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform p-1"
                        aria-label={t('curator.social.youtube')}
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {curator.websiteUrl && (
                      <a
                        href={curator.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:scale-110 transition-transform p-1"
                        aria-label={t('curator.social.website')}
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Style Tags */}
            {hasTags && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {styleTags.slice(0, 5).map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30"
                  >
                    {t(`explore.filter.tags.${tag}` as any) || tag}
                  </span>
                ))}
                {styleTags.length > 5 && (
                  <span className={clsx('text-xs font-bold px-2', statsClass)}>
                    +{styleTags.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <FollowButton
              curatorId={curator.id}
              curatorSlug={curator.slug || ''}
            />
              <ShareButton />
          </div>
        </div>
      </div>
    </section>
  );
}
