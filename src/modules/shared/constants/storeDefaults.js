import { premiumMedia } from '@/modules/shared/constants/premiumMedia';

export const categoryCatalog = [
  {
    slug: 'all',
    name: 'All Bags',
    description: 'Every drop, from wedding edits to night-out icons.',
  },
  {
    slug: 'bridal',
    name: 'Bridal',
    description: 'Statement clutches and potlis for ceremonies and receptions.',
  },
  {
    slug: 'custom-bags',
    name: 'Custom Bags',
    description: 'Personalized gifting and bridal-name embroidery.',
  },
  {
    slug: 'party',
    name: 'Party',
    description: 'Crystal, shimmer, and after-dark silhouettes.',
  },
  {
    slug: 'wedding',
    name: 'Wedding',
    description: 'Curated pieces for bridesmaids, cocktails, and trousseau looks.',
  },
];

export const orderStatusOptions = [
  'New',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const storeSettingsFallback = {
  id: 1,
  mode: 'GROWTH',
  brandName: 'LuxeBag by Raiya',
  brandShortName: 'LuxeBag',
  tagline: 'Minimal luxury bags for bridal nights, gifting, and sharp everyday looks.',
  announcementText: 'Free shipping across India • COD available • 7-day easy returns',
  heroKicker: 'Curated Festive Capsule',
  heroTitle: 'Bags that land soft and leave a statement.',
  heroSubtitle:
    'Premium bridal clutches, custom gifting edits, and sculpted evening pieces built for the camera and real life.',
  heroImage: premiumMedia.hero,
  heroSecondaryImage: premiumMedia.editorial,
  campaignImage: premiumMedia.campaign,
  contactEmail: 'hello@luxebag.in',
  supportPhone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  instagramHandle: '@onli.nebags07',
  instagramUrl: 'https://instagram.com/onli.nebags07',
  addressLine: 'Fashion District, Mumbai 400001',
  supportHours: 'Mon - Sat, 10:00 AM - 7:00 PM',
  trustedBadgeText: '8.9k+ Instagram community',
  faqItems: [
    {
      question: 'Do you offer free delivery?',
      answer: 'Yes. We offer free delivery across India on every order.',
    },
    {
      question: 'Is Cash on Delivery available?',
      answer: 'Yes. COD is available for eligible locations across India.',
    },
    {
      question: 'Can I personalize a bag?',
      answer: 'Yes. Selected products support name embroidery and custom color combinations.',
    },
    {
      question: 'How long does dispatch take?',
      answer: 'Ready-to-ship pieces dispatch within 24 to 48 hours. Custom pieces take slightly longer.',
    },
  ],
  trustBarItems: [
    'Free delivery',
    'COD available',
    'Premium quality check',
    'Easy returns',
    'Secure checkout',
  ],
  socialLinks: {
    instagram: 'https://instagram.com/onli.nebags07',
    facebook: '#',
    twitter: '#',
  },
};

export const instagramSettingsFallback = {
  id: 1,
  handle: storeSettingsFallback.instagramHandle,
  profileUrl: storeSettingsFallback.instagramUrl,
  badgeText: storeSettingsFallback.trustedBadgeText,
  gallery: premiumMedia.gallery,
};
