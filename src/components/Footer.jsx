import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useStore } from '@/contexts/ModeContext';

const Footer = () => {
  const { settings } = useStore();
  const brandLabel = settings.brandShortName || 'Luxe';
  const compactBrand = brandLabel.toUpperCase().replace(/\s+/g, '');
  const brandPrefix = compactBrand.endsWith('BAG')
    ? compactBrand.slice(0, -3)
    : compactBrand;
  const brandSuffix = compactBrand.endsWith('BAG') ? 'BAG' : '';

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Shop', href: '/shop' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ];

  const customerService = [
    { name: 'FAQs', href: '/faq' },
    { name: 'Delivery & Returns', href: '/delivery-returns' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms-conditions' },
  ];

  const socialLinks = [
    { icon: Facebook, href: settings.socialLinks?.facebook || '#', label: 'Facebook' },
    { icon: Instagram, href: settings.socialLinks?.instagram || '#', label: 'Instagram' },
    { icon: Twitter, href: settings.socialLinks?.twitter || '#', label: 'Twitter' },
  ];

  return (
    <footer className="bg-black text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="text-2xl font-bold tracking-tight">
              {brandPrefix}
              {brandSuffix ? <span className="text-yellow-600">{brandSuffix}</span> : null}
            </span>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              {settings.tagline || 'Premium luxury bags crafted with excellence. Your style, our passion.'}
            </p>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-yellow-600 transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <span className="text-lg font-semibold">Quick Links</span>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-600 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold">Customer Service</span>
            <ul className="mt-4 space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-600 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="text-lg font-semibold">Contact Us</span>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start space-x-3 text-gray-400 text-sm">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>{settings.addressLine}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>{settings.supportPhone}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400 text-sm">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>{settings.contactEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} LuxeBag. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
