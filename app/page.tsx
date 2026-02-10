import Header from '@/components/Header'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'
import AskNigel from '@/components/AskNigel'
import NigelDemo from '@/components/NigelDemo'
import { fetchFeaturedWithFallback } from '@/lib/curators/fetchFeaturedWithFallback'
import CuratorsSectionPeek from '@/components/curators/CuratorsSectionPeek'
import { getLocale } from '@/lib/i18n/getLocale'
import { t } from '@/lib/i18n/t'

export default async function Home() {
  const curators = await fetchFeaturedWithFallback(12); // enough to fill two+ rows
  const locale = await getLocale()
  
  return (
    <>
      <Hero />
      <CuratorsSectionPeek
        title={t(locale, 'home.featuredCurators.title')}
        subtitle={t(locale, 'home.featuredCurators.subtitle')}
        curators={curators}
        maxVisiblePx={780}  // tune until the second row "peeks" nicely
        ctaHref="/explore"
        ctaLabel={t(locale, 'home.featuredCurators.cta')}
      />
      <NigelDemo />
      <HowItWorks />
      <Testimonials />
      <Footer />
      <AskNigel />
    </>
  )
} 