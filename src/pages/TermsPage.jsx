import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions - LuxeBag</title>
        <meta
          name="description"
          content="Read LuxeBag's terms and conditions for using our website and purchasing products."
        />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms & Conditions</h1>

            <div className="max-w-none">
              <p className="text-gray-600 mb-8">Last updated: December 14, 2025</p>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700">
                  By accessing and using LuxeBag&apos;s website, you accept and agree to be bound by these Terms and Conditions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">2. Products and Services</h2>
                <p className="text-gray-700 mb-4">
                  All products are subject to availability. We reserve the right to limit quantities and discontinue products at any time.
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Product images are for illustration purposes</li>
                  <li>Colors may vary from screen display</li>
                  <li>Prices are subject to change without notice</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">3. Orders and Payment</h2>
                <p className="text-gray-700 mb-4">By placing an order, you agree to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Provide accurate billing and shipping information</li>
                  <li>Pay for all ordered products</li>
                  <li>Accept responsibility for all charges</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">4. Shipping and Delivery</h2>
                <p className="text-gray-700">
                  We strive to deliver within estimated timeframes, but delays may occur due to unforeseen circumstances. We are not responsible for delays caused by shipping carriers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">5. Returns and Refunds</h2>
                <p className="text-gray-700">
                  Returns must be initiated within 7 days of delivery. Products must be unused and in original condition. Refunds will be processed within 5-7 business days after receiving the returned item.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">6. Limitation of Liability</h2>
                <p className="text-gray-700">
                  LuxeBag shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
                <p className="text-gray-700">
                  For questions about these Terms, contact us at info@luxebag.com
                </p>
              </section>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default TermsPage;
