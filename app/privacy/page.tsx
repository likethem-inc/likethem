'use client'

import { motion } from 'framer-motion'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <div className="min-h-screen bg-white py-24">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-heading font-serif mb-4">
                Privacy Policy
              </h1>
              <p className="text-warm-gray">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">1. Introduction</h2>
                <p className="text-warm-gray mb-4">
                  Welcome to LikeThem. We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy will inform you about how we look after your personal data when you visit 
                  our website and tell you about your privacy rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">2. Data We Collect</h2>
                <p className="text-warm-gray mb-4">
                  We may collect, use, store and transfer different kinds of personal data about you:
                </p>
                <ul className="list-disc pl-6 text-warm-gray space-y-2">
                  <li>Identity Data: name, username, profile information</li>
                  <li>Contact Data: email address, social media handles</li>
                  <li>Transaction Data: details about purchases and payments</li>
                  <li>Technical Data: IP address, browser type, device information</li>
                  <li>Usage Data: information about how you use our website</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">3. How We Use Your Data</h2>
                <p className="text-warm-gray mb-4">
                  We use your personal data for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-warm-gray space-y-2">
                  <li>To process and deliver your orders</li>
                  <li>To manage your account and provide customer support</li>
                  <li>To send you marketing communications (with your consent)</li>
                  <li>To improve our website and services</li>
                  <li>To protect against fraud and ensure security</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">4. Data Security</h2>
                <p className="text-warm-gray mb-4">
                  We have implemented appropriate security measures to prevent your personal data from being 
                  accidentally lost, used or accessed in an unauthorized way. We limit access to your personal 
                  data to those employees and partners who have a business need to know.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">5. Your Rights</h2>
                <p className="text-warm-gray mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 text-warm-gray space-y-2">
                  <li>Request access to your personal data</li>
                  <li>Request correction of your personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                  <li>Request transfer of your personal data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">6. Cookies</h2>
                <p className="text-warm-gray mb-4">
                  We use cookies and similar tracking technologies to track activity on our website and store 
                  certain information. You can instruct your browser to refuse all cookies or to indicate when 
                  a cookie is being sent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">7. Third-Party Services</h2>
                <p className="text-warm-gray mb-4">
                  We may share your data with trusted third parties including payment processors, shipping 
                  providers, and analytics services. These parties are obligated to protect your data and use 
                  it only for the purposes we specify.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">8. Data Retention</h2>
                <p className="text-warm-gray mb-4">
                  We will only retain your personal data for as long as necessary to fulfill the purposes we 
                  collected it for, including for the purposes of satisfying any legal, accounting, or reporting 
                  requirements.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">9. Changes to This Policy</h2>
                <p className="text-warm-gray mb-4">
                  We may update this privacy policy from time to time. We will notify you of any changes by 
                  posting the new privacy policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="font-serif text-2xl font-light mb-4">10. Contact Us</h2>
                <p className="text-warm-gray mb-4">
                  If you have any questions about this privacy policy or our privacy practices, please contact us at:
                </p>
                <p className="text-warm-gray">
                  Email: <a href="mailto:help@likethem.io" className="text-carbon hover:underline">help@likethem.io</a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  )
}
