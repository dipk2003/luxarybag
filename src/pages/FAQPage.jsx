import React from 'react';
import { Helmet } from 'react-helmet';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const FAQPage = () => {
  const { faqs } = useSupabaseData();

  return (
    <>
      <Helmet>
        <title>FAQs - Frequently Asked Questions | LuxeBag</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about LuxeBag products, delivery, returns, and more."
        />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 mb-12">Find answers to common questions about our products and services</p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center justify-between">
                    {faq.question}
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-yellow-50 p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-gray-700 mb-6">Our customer support team is here to help you</p>
              <a
                href="/contact"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default FAQPage;
