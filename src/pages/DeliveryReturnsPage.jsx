import React from 'react';
import { Helmet } from 'react-helmet';
import { Truck, RotateCcw, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DeliveryReturnsPage = () => {
  return (
    <>
      <Helmet>
        <title>Delivery & Returns Policy - LuxeBag</title>
        <meta
          name="description"
          content="Learn about LuxeBag's delivery and returns policy. Free delivery across India, easy 7-day returns."
        />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-12">Delivery & Returns</h1>

            <div className="space-y-12">
              <section>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <Truck className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Delivery Information</h2>
                </div>
                <div className="text-gray-700">
                  <p className="mb-4">
                    We offer <strong>FREE delivery</strong> on all orders across India. Your luxury bags will be carefully packaged and shipped to ensure they arrive in perfect condition.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Standard Delivery: 3-5 business days</li>
                    <li>Express Delivery: 1-2 business days in select cities</li>
                    <li>Cash on Delivery available</li>
                    <li>Track your order in real-time</li>
                    <li>Signature required upon delivery</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <RotateCcw className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Returns Policy</h2>
                </div>
                <div className="text-gray-700">
                  <p className="mb-4">
                    We want you to be completely satisfied with your purchase. If you are not happy, we offer <strong>easy 7-day returns</strong>.
                  </p>
                  <h4 className="font-semibold mt-6 mb-3">Return Conditions:</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Item must be unused and in original condition</li>
                    <li>Original packaging and tags must be intact</li>
                    <li>Return request must be initiated within 7 days of delivery</li>
                    <li>Free return pickup from your location</li>
                    <li>Full refund processed within 5-7 business days</li>
                  </ul>
                </div>
              </section>

              <section>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Quality Assurance</h2>
                </div>
                <div className="text-gray-700">
                  <p>
                    Every bag goes through a <strong>100% quality check</strong> before shipping. We inspect for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 mt-4">
                    <li>Material quality and authenticity</li>
                    <li>Stitching and craftsmanship</li>
                    <li>Hardware functionality</li>
                    <li>Overall condition and presentation</li>
                  </ul>
                </div>
              </section>
            </div>

            <div className="mt-12 bg-yellow-50 p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">Need Help?</h3>
              <p className="text-gray-700 mb-6">
                If you have any questions about delivery or returns, our customer support team is here to assist you.
              </p>
              <a
                href="/contact"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DeliveryReturnsPage;
