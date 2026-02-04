'use client'

import { motion } from 'framer-motion'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="prose prose-neutral max-w-none"
        >
          <h1 className="text-4xl font-serif font-light mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: 03/02/2026</p>
          
          <p className="text-lg mb-8">
            Welcome to LikeThem. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the LikeThem website, app, and services (the &quot;Platform&quot;). By using LikeThem, you agree to these Terms.
          </p>
          
          <p className="text-lg mb-12">
            If you do not agree, please do not use the Platform.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">1. About LikeThem</h2>
            <p>
              LikeThem is a creator-led fashion commerce platform that allows creators to curate and sell outfits and allows users to discover and purchase fashion items through curated experiences.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years old (or the legal age in your country) to use LikeThem. By using the Platform, you represent that you meet this requirement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">3. User Accounts</h2>
            <p className="mb-4">You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing accurate information</li>
              <li>Keeping your login credentials secure</li>
              <li>All activity that occurs under your account</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">4. Creator Accounts</h2>
            <p className="mb-4">Creators using LikeThem to sell products agree that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>They own or have the right to sell the items listed</li>
              <li>Product descriptions and images are accurate</li>
              <li>They comply with all applicable laws and regulations</li>
              <li>They are responsible for fulfilling orders properly</li>
            </ul>
            <p className="mt-4">
              LikeThem does not guarantee sales or audience reach.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">5. Purchases & Payments</h2>
            <p className="mb-4">When you make a purchase:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You agree to pay the listed price and applicable fees</li>
              <li>Payments are processed by third-party payment providers</li>
              <li>LikeThem is not responsible for payment processor errors</li>
            </ul>
            <p className="mt-4">
              LikeThem may charge a commission on each transaction.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">6. Returns & Refunds</h2>
            <p className="mb-4">Return and refund policies are defined by:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The individual creator</li>
              <li>Or by LikeThem if stated otherwise</li>
            </ul>
            <p className="mt-4">
              LikeThem does not guarantee refunds unless explicitly stated.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">7. Platform Rules</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use LikeThem for unlawful purposes</li>
              <li>Post false, misleading, or infringing content</li>
              <li>Harass or abuse other users</li>
              <li>Attempt to bypass platform fees or systems</li>
            </ul>
            <p className="mt-4">
              We reserve the right to remove content or accounts violating these rules.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">8. Intellectual Property</h2>
            <p>
              All platform content (logos, design, text, software) belongs to LikeThem or its licensors. Users retain ownership of content they upload but grant LikeThem a license to display and distribute it within the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">9. Disclaimer of Warranties</h2>
            <p>
              LikeThem is provided &quot;as is&quot; and &quot;as available.&quot; We do not guarantee uninterrupted service, error-free operation, or specific results from using the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">10. Limitation of Liability</h2>
            <p className="mb-4">LikeThem is not liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Indirect or consequential damages</li>
              <li>Loss of profits or data</li>
              <li>Issues arising from creator-user transactions</li>
            </ul>
            <p className="mt-4">
              Our liability is limited to the maximum extent permitted by law.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">11. Termination</h2>
            <p className="mb-4">We may suspend or terminate your access if:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You violate these Terms</li>
              <li>Your conduct harms the Platform or other users</li>
            </ul>
            <p className="mt-4">
              You may stop using LikeThem at any time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">12. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Changes will be posted on this page with a new &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of Perú.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif font-light mb-4">14. Contact</h2>
            <p className="mb-4">For questions about these Terms, contact:</p>
            <ul className="list-none pl-0 space-y-2">
              <li>Email: help@likethem.com</li>
              <li>Company: LikeThem</li>
              <li>Country: Peru</li>
            </ul>
          </section>
        </motion.div>
      </div>
    </div>
  )
}
