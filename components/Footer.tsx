'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import Logo from './Logo'
import { useT } from '@/hooks/useT'

export default function Footer() {
  const t = useT()
  
  return (
    <footer className="bg-carbon text-white py-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              {t('footer.description')}
            </p>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">{t('footer.newsletter.title')}</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder={t('footer.newsletter.emailPlaceholder')}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <button 
                  className="px-4 py-2 bg-white text-carbon hover:bg-gray-200 transition-colors"
                  aria-label={t('footer.newsletter.buttonAriaLabel')}
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-medium mb-4">{t('footer.explore.title')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/explore" className="hover:text-white transition-colors">{t('footer.explore.stores')}</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">{t('footer.explore.curators')}</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">{t('footer.explore.collections')}</Link></li>
              <li><Link href="/explore" className="hover:text-white transition-colors">{t('footer.explore.trending')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-medium mb-4">{t('footer.company.title')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition-colors">{t('footer.company.about')}</Link></li>
              <li><Link href="/access" className="hover:text-white transition-colors">{t('footer.company.requestAccess')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('footer.company.contact')}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t('footer.company.privacy')}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">{t('footer.company.termsOfService')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
} 