'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import CTAButton from '@/components/ui/CTAButton'
import { useTranslation } from '@/hooks/useTranslation'

export default function AboutPage() {
  const { t } = useTranslation()

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/about/hero.jpg"
            alt="About LikeThem"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white container-custom px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide">
              {t('about.hero.title')}
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
              {t('about.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-white py-24">
        <div className="container-custom max-w-4xl px-4">
          <motion.div {...fadeInUp}>
            <h2 className="font-serif text-4xl md:text-5xl text-carbon mb-8 text-center">
              {t('about.story.title')}
            </h2>
            
            <div className="space-y-6 text-lg text-zinc-700 leading-relaxed">
              <p>
                {t('about.story.paragraph1')}
              </p>
              <p>
                {t('about.story.paragraph2')}
              </p>
              <p>
                {t('about.story.paragraph3')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-stone py-24">
        <div className="container-custom max-w-5xl px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-carbon mb-6">
              {t('about.howItWorks.title')}
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t('about.howItWorks.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-carbon rounded-full flex items-center justify-center">
                <span className="text-2xl font-serif text-white">1</span>
              </div>
              <h3 className="font-serif text-2xl text-carbon mb-4">
                {t('about.howItWorks.step1.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.howItWorks.step1.description')}
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-carbon rounded-full flex items-center justify-center">
                <span className="text-2xl font-serif text-white">2</span>
              </div>
              <h3 className="font-serif text-2xl text-carbon mb-4">
                {t('about.howItWorks.step2.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.howItWorks.step2.description')}
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-carbon rounded-full flex items-center justify-center">
                <span className="text-2xl font-serif text-white">3</span>
              </div>
              <h3 className="font-serif text-2xl text-carbon mb-4">
                {t('about.howItWorks.step3.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.howItWorks.step3.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-24">
        <div className="container-custom max-w-6xl px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl text-carbon mb-6">
              {t('about.values.title')}
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              {t('about.values.subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Value 1 - Exclusivity */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="p-8 bg-stone rounded-lg"
            >
              <h3 className="font-serif text-3xl text-carbon mb-4">
                {t('about.values.exclusivity.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.values.exclusivity.description')}
              </p>
            </motion.div>

            {/* Value 2 - Curation */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="p-8 bg-stone rounded-lg"
            >
              <h3 className="font-serif text-3xl text-carbon mb-4">
                {t('about.values.curation.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.values.curation.description')}
              </p>
            </motion.div>

            {/* Value 3 - Quality */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="p-8 bg-stone rounded-lg"
            >
              <h3 className="font-serif text-3xl text-carbon mb-4">
                {t('about.values.quality.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.values.quality.description')}
              </p>
            </motion.div>

            {/* Value 4 - Community */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="p-8 bg-stone rounded-lg"
            >
              <h3 className="font-serif text-3xl text-carbon mb-4">
                {t('about.values.community.title')}
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                {t('about.values.community.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-carbon text-white py-24">
        <div className="container-custom max-w-4xl px-4">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="font-serif text-4xl md:text-5xl mb-8">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-light">
              {t('about.mission.statement')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-stone py-24">
        <div className="container-custom max-w-4xl px-4">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-carbon mb-6">
              {t('about.cta.title')}
            </h2>
            <p className="text-lg text-zinc-600 mb-10 max-w-2xl mx-auto">
              {t('about.cta.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton 
                as="link" 
                href="/access" 
                variant="primary" 
                size="lg"
              >
                {t('about.cta.requestAccess')}
              </CTAButton>

              <CTAButton 
                as="link" 
                href="/apply" 
                variant="secondary" 
                size="lg"
              >
                {t('about.cta.applyCurator')}
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section (Optional) */}
      <section className="bg-white py-24">
        <div className="container-custom max-w-4xl px-4">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="font-serif text-4xl md:text-5xl text-carbon mb-6">
              {t('about.team.title')}
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              {t('about.team.description')}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  )
}
