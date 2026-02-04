'use client'

import { motion } from 'framer-motion'
import { Phone, Instagram, Music2 } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const contactMethods = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+51 957 566 408',
      href: 'tel:+51957566408',
      description: 'Call us directly'
    },
    {
      icon: Instagram,
      label: 'Instagram',
      value: '@likethem',
      href: 'https://www.instagram.com/likethem',
      description: 'Follow us on Instagram'
    },
    {
      icon: Music2,
      label: 'TikTok',
      value: '@likethem',
      href: 'https://www.tiktok.com/@likethem',
      description: 'Check our TikTok'
    }
  ]

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white to-stone/30">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32">
          <div className="container-custom">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerChildren}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Title */}
              <motion.h1 
                variants={fadeInUp}
                className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide uppercase"
              >
                Get in Touch
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                variants={fadeInUp}
                className="text-lg md:text-xl text-warm-gray font-light max-w-2xl mx-auto mb-16"
              >
                Have questions about curating your store or need assistance? 
                We&apos;d love to hear from you.
              </motion.p>

              {/* Contact Methods Grid */}
              <motion.div 
                variants={staggerChildren}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
              >
                {contactMethods.map((method) => {
                  const Icon = method.icon
                  return (
                    <motion.div
                      key={method.label}
                      variants={fadeInUp}
                    >
                      <Link
                        href={method.href}
                        target={method.href.startsWith('http') ? '_blank' : undefined}
                        rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group block p-8 bg-white border border-black/5 hover:border-black/20 transition-all duration-300 hover:shadow-lg"
                      >
                        {/* Icon */}
                        <div className="mb-6 flex justify-center">
                          <div className="w-16 h-16 rounded-full bg-carbon/5 flex items-center justify-center group-hover:bg-carbon/10 transition-colors duration-300">
                            <Icon className="w-7 h-7 text-carbon" strokeWidth={1.5} />
                          </div>
                        </div>

                        {/* Label */}
                        <h3 className="font-medium text-xl mb-2 text-carbon">
                          {method.label}
                        </h3>

                        {/* Value */}
                        <p className="text-carbon/70 font-light mb-2">
                          {method.value}
                        </p>

                        {/* Description */}
                        <p className="text-sm text-warm-gray group-hover:text-carbon transition-colors duration-300">
                          {method.description}
                        </p>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="py-16 bg-carbon text-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-6">
                Business Inquiries
              </h2>
              <p className="text-gray-300 text-lg font-light leading-relaxed mb-8">
                Interested in becoming a curator or partnering with LikeThem? 
                Reach out to us through any of the channels above, and our team 
                will get back to you within 24-48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/apply"
                  className="inline-block px-8 py-4 bg-white text-carbon font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-colors duration-300"
                >
                  Apply to Curate
                </Link>
                <Link
                  href="/explore"
                  className="inline-block px-8 py-4 border border-white text-white font-medium tracking-wide uppercase text-sm hover:bg-white hover:text-carbon transition-all duration-300"
                >
                  Explore Stores
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Office Hours Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-6 text-carbon">
                Support Hours
              </h2>
              <p className="text-warm-gray text-lg font-light leading-relaxed">
                Our support team is available Monday through Friday, 9:00 AM - 6:00 PM (EST). 
                We typically respond to all inquiries within one business day.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
