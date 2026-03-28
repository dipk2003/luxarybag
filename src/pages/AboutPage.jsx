import React from 'react';
import { Helmet } from 'react-helmet';
import { Award, Heart, Shield, Truck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Passion',
      description: 'We are passionate about creating luxury bags that elevate your style',
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'Every bag is crafted with premium materials and exceptional attention to detail',
    },
    {
      icon: Shield,
      title: 'Trust',
      description: '100% quality check and secure payments ensure your peace of mind',
    },
    {
      icon: Truck,
      title: 'Service',
      description: 'Free delivery across India and easy returns within 7 days',
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Us - Premium Luxury Bags | LuxeBag</title>
        <meta
          name="description"
          content="Learn about LuxeBag's commitment to quality, craftsmanship, and customer satisfaction. Discover our story and values."
        />
      </Helmet>

      <div className="min-h-screen">
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">About LuxeBag</h1>

            <div className="max-w-none mb-12">
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to LuxeBag, where luxury meets functionality. We are dedicated to bringing you the finest collection of premium handbags that combine timeless elegance with modern design.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our journey began with a simple vision: to make luxury accessible. Each bag in our collection is carefully curated and crafted from the finest materials, ensuring that every piece tells a story of quality and sophistication.
              </p>
              <p className="text-gray-700 leading-relaxed">
                At LuxeBag, we believe that a great bag is more than just an accessory. It is an investment in your style and confidence. That is why we are committed to offering only the best, backed by our promise of quality, authenticity, and exceptional customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {values.map((value, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <value.icon className="w-12 h-12 text-yellow-600 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-700">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4">Our Promise</h2>
              <p className="text-gray-700 leading-relaxed">
                Every LuxeBag purchase comes with our guarantee of quality, authenticity, and satisfaction. We are here to ensure your shopping experience is as luxurious as the bags we offer.
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
