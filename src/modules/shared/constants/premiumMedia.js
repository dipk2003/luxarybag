export const premiumMedia = {
  // Hero: elegant luxury handbag on dark background
  hero:
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80&auto=format&fit=crop',
  // Editorial: designer bag close-up
  editorial:
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1200&q=80&auto=format&fit=crop',
  // Studio: premium handbag product shot
  studio:
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80&auto=format&fit=crop',
  // Campaign: luxury bags lifestyle
  campaign:
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80&auto=format&fit=crop',
  categories: {
    bridal:
      'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800&q=80&auto=format&fit=crop',
    'custom-bags':
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop',
    party:
      'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=800&q=80&auto=format&fit=crop',
    wedding:
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80&auto=format&fit=crop',
    default:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80&auto=format&fit=crop',
  },
  gallery: [
    'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&auto=format&fit=crop',
  ],
};

export const getCategoryMedia = (category) =>
  premiumMedia.categories[category] || premiumMedia.categories.default;

export const getProductFallbackImages = (category) => {
  const categoryImage = getCategoryMedia(category);
  return [
    categoryImage,
    premiumMedia.editorial,
    premiumMedia.studio,
    premiumMedia.campaign,
  ];
};
