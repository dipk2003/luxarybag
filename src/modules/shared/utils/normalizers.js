import {
  instagramSettingsFallback,
  storeSettingsFallback,
} from '@/modules/shared/constants/storeDefaults';
import { getProductFallbackImages } from '@/modules/shared/constants/premiumMedia';
import {
  formatDate,
  normalizePhoneNumber,
  safeParseJson,
  slugify,
} from '@/modules/shared/utils/formatters';

const toArray = (value, fallback = []) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  const parsed = safeParseJson(value, fallback);
  return Array.isArray(parsed) ? parsed.filter(Boolean) : fallback;
};

const toNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
};

export const normalizeProduct = (record = {}) => {
  const category = record.category || 'bridal';
  const images = toArray(record.images, getProductFallbackImages(category));
  const price = toNumber(record.price);
  const originalPrice = toNumber(record.original_price ?? record.originalPrice, price);
  const discount =
    toNumber(record.discount) ||
    (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const personalizationOptions = safeParseJson(record.personalization_options, {});
  const highlights = toArray(record.highlights, []);

  return {
    ...record,
    id: record.id,
    name: record.name || 'Untitled Product',
    slug: record.slug || slugify(record.name || 'product'),
    sku: record.sku || '',
    category,
    price,
    originalPrice,
    original_price: originalPrice,
    discount,
    description: record.description || '',
    shortDescription: record.short_description || record.shortDescription || '',
    short_description: record.short_description || record.shortDescription || '',
    rating: toNumber(record.rating, 4.8),
    reviewsCount: toNumber(record.reviews_count, 0),
    reviews_count: toNumber(record.reviews_count, 0),
    images,
    featuredImage: images[0],
    inStock: toBoolean(record.in_stock ?? record.inStock, true),
    in_stock: toBoolean(record.in_stock ?? record.inStock, true),
    featured: toBoolean(record.featured, false),
    isNewArrival: toBoolean(record.is_new_arrival ?? record.isNewArrival, false),
    is_new_arrival: toBoolean(record.is_new_arrival ?? record.isNewArrival, false),
    isBestSeller: toBoolean(record.is_best_seller ?? record.isBestSeller, false),
    is_best_seller: toBoolean(record.is_best_seller ?? record.isBestSeller, false),
    isCustomizable: toBoolean(record.is_customizable ?? record.isCustomizable, false),
    is_customizable: toBoolean(record.is_customizable ?? record.isCustomizable, false),
    personalizationOptions,
    personalization_options: personalizationOptions,
    highlights,
    material: record.material || 'Premium embellished textile',
    deliveryNote: record.delivery_note || record.deliveryNote || 'Ships in 24-48 hours',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
};

export const toProductPayload = (product = {}) => ({
  name: product.name,
  slug: slugify(product.slug || product.name),
  sku: product.sku || null,
  category: product.category,
  price: toNumber(product.price),
  original_price: toNumber(product.originalPrice ?? product.original_price ?? product.price),
  discount: toNumber(product.discount),
  short_description: product.shortDescription || product.short_description || null,
  description: product.description || null,
  rating: toNumber(product.rating, 4.8),
  reviews_count: toNumber(product.reviewsCount ?? product.reviews_count),
  images: toArray(product.images, []),
  in_stock: toBoolean(product.inStock ?? product.in_stock, true),
  featured: toBoolean(product.featured, false),
  is_new_arrival: toBoolean(product.isNewArrival ?? product.is_new_arrival, false),
  is_best_seller: toBoolean(product.isBestSeller ?? product.is_best_seller, false),
  is_customizable: toBoolean(product.isCustomizable ?? product.is_customizable, false),
  personalization_options:
    safeParseJson(product.personalizationOptions ?? product.personalization_options, {}) || {},
  highlights: toArray(product.highlights, []),
  material: product.material || null,
  delivery_note: product.deliveryNote || product.delivery_note || null,
});

export const normalizeReview = (record = {}) => ({
  ...record,
  id: record.id,
  name: record.name || 'Anonymous',
  rating: toNumber(record.rating, 5),
  comment: record.comment || '',
  verified: toBoolean(record.verified, false),
  productId: record.product_id,
  product_id: record.product_id,
  product: record.products?.name || record.product || 'LuxeBag',
  productSlug: record.products?.slug || record.product_slug || '',
  date: formatDate(record.created_at),
  createdAt: record.created_at,
});

export const toReviewPayload = (review = {}) => ({
  product_id: review.productId || review.product_id || null,
  name: review.name,
  rating: toNumber(review.rating, 5),
  comment: review.comment,
  verified: toBoolean(review.verified, false),
});

export const normalizeBlogPost = (record = {}) => ({
  ...record,
  id: record.id,
  title: record.title || 'Untitled Post',
  slug: record.slug || slugify(record.title || 'post'),
  excerpt: record.excerpt || record.meta_description || '',
  metaDescription: record.meta_description || '',
  meta_description: record.meta_description || '',
  content: record.content || '',
  featuredImage: record.featured_image || '',
  featured_image: record.featured_image || '',
  category: record.category || 'Style',
  published: toBoolean(record.published, true),
  readTime: record.read_time || record.readTime || '4 min read',
  read_time: record.read_time || record.readTime || '4 min read',
  createdAt: record.created_at,
  publishedAt: record.published_at || record.created_at,
});

export const toBlogPostPayload = (post = {}) => ({
  title: post.title,
  slug: slugify(post.slug || post.title),
  excerpt: post.excerpt || null,
  meta_description: post.metaDescription || post.meta_description || null,
  content: post.content || null,
  featured_image: post.featuredImage || post.featured_image || null,
  category: post.category || 'Style',
  published: toBoolean(post.published, true),
  read_time: post.readTime || post.read_time || null,
});

export const normalizeInstagramSettings = (record = {}) => {
  const merged = {
    ...instagramSettingsFallback,
    ...record,
  };

  const gallery = toArray(
    merged.gallery || merged.feed_images,
    instagramSettingsFallback.gallery,
  );

  return {
    ...merged,
    gallery,
    handle: merged.handle || merged.instagram_handle || instagramSettingsFallback.handle,
    profileUrl:
      merged.profile_url || merged.profileUrl || merged.feed_url || instagramSettingsFallback.profileUrl,
    profile_url:
      merged.profile_url || merged.profileUrl || merged.feed_url || instagramSettingsFallback.profileUrl,
    badgeText:
      merged.badge_text || merged.badgeText || merged.trusted_badge_text || instagramSettingsFallback.badgeText,
    badge_text:
      merged.badge_text || merged.badgeText || merged.trusted_badge_text || instagramSettingsFallback.badgeText,
    trusted_badge_text:
      merged.badge_text || merged.badgeText || merged.trusted_badge_text || instagramSettingsFallback.badgeText,
  };
};

export const toInstagramSettingsPayload = (settings = {}) => ({
  id: settings.id || 1,
  handle: settings.handle || settings.instagram_handle || null,
  profile_url: settings.profileUrl || settings.profile_url || settings.feed_url || null,
  badge_text: settings.badgeText || settings.badge_text || settings.trusted_badge_text || null,
  gallery: toArray(settings.gallery, instagramSettingsFallback.gallery),
});

export const normalizeStoreSettings = (record = {}) => {
  const merged = {
    ...storeSettingsFallback,
    ...record,
  };

  return {
    ...merged,
    brandName: merged.brand_name || merged.brandName || storeSettingsFallback.brandName,
    brand_name: merged.brand_name || merged.brandName || storeSettingsFallback.brandName,
    brandShortName:
      merged.brand_short_name || merged.brandShortName || storeSettingsFallback.brandShortName,
    brand_short_name:
      merged.brand_short_name || merged.brandShortName || storeSettingsFallback.brandShortName,
    announcementText:
      merged.announcement_text || merged.announcementText || storeSettingsFallback.announcementText,
    announcement_text:
      merged.announcement_text || merged.announcementText || storeSettingsFallback.announcementText,
    heroKicker: merged.hero_kicker || merged.heroKicker || storeSettingsFallback.heroKicker,
    hero_kicker: merged.hero_kicker || merged.heroKicker || storeSettingsFallback.heroKicker,
    heroTitle: merged.hero_title || merged.heroTitle || storeSettingsFallback.heroTitle,
    hero_title: merged.hero_title || merged.heroTitle || storeSettingsFallback.heroTitle,
    heroSubtitle:
      merged.hero_subtitle || merged.heroSubtitle || storeSettingsFallback.heroSubtitle,
    hero_subtitle:
      merged.hero_subtitle || merged.heroSubtitle || storeSettingsFallback.heroSubtitle,
    heroImage: merged.hero_image || merged.heroImage || storeSettingsFallback.heroImage,
    hero_image: merged.hero_image || merged.heroImage || storeSettingsFallback.heroImage,
    heroSecondaryImage:
      merged.hero_secondary_image ||
      merged.heroSecondaryImage ||
      storeSettingsFallback.heroSecondaryImage,
    hero_secondary_image:
      merged.hero_secondary_image ||
      merged.heroSecondaryImage ||
      storeSettingsFallback.heroSecondaryImage,
    campaignImage:
      merged.campaign_image || merged.campaignImage || storeSettingsFallback.campaignImage,
    campaign_image:
      merged.campaign_image || merged.campaignImage || storeSettingsFallback.campaignImage,
    contactEmail:
      merged.contact_email || merged.contactEmail || storeSettingsFallback.contactEmail,
    contact_email:
      merged.contact_email || merged.contactEmail || storeSettingsFallback.contactEmail,
    supportPhone:
      merged.support_phone || merged.supportPhone || storeSettingsFallback.supportPhone,
    support_phone:
      merged.support_phone || merged.supportPhone || storeSettingsFallback.supportPhone,
    whatsappNumber:
      normalizePhoneNumber(
        merged.whatsapp_number || merged.whatsappNumber || storeSettingsFallback.whatsappNumber,
      ) || storeSettingsFallback.whatsappNumber,
    whatsapp_number:
      normalizePhoneNumber(
        merged.whatsapp_number || merged.whatsappNumber || storeSettingsFallback.whatsappNumber,
      ) || storeSettingsFallback.whatsappNumber,
    instagramHandle:
      merged.instagram_handle || merged.instagramHandle || storeSettingsFallback.instagramHandle,
    instagram_handle:
      merged.instagram_handle || merged.instagramHandle || storeSettingsFallback.instagramHandle,
    instagramUrl:
      merged.instagram_url || merged.instagramUrl || storeSettingsFallback.instagramUrl,
    instagram_url:
      merged.instagram_url || merged.instagramUrl || storeSettingsFallback.instagramUrl,
    addressLine:
      merged.address_line || merged.addressLine || storeSettingsFallback.addressLine,
    address_line:
      merged.address_line || merged.addressLine || storeSettingsFallback.addressLine,
    supportHours:
      merged.support_hours || merged.supportHours || storeSettingsFallback.supportHours,
    support_hours:
      merged.support_hours || merged.supportHours || storeSettingsFallback.supportHours,
    trustedBadgeText:
      merged.trusted_badge_text ||
      merged.trustedBadgeText ||
      storeSettingsFallback.trustedBadgeText,
    trusted_badge_text:
      merged.trusted_badge_text ||
      merged.trustedBadgeText ||
      storeSettingsFallback.trustedBadgeText,
    faqItems: toArray(merged.faq_items || merged.faqItems, storeSettingsFallback.faqItems),
    faq_items: toArray(merged.faq_items || merged.faqItems, storeSettingsFallback.faqItems),
    trustBarItems: toArray(
      merged.trust_bar_items || merged.trustBarItems,
      storeSettingsFallback.trustBarItems,
    ),
    trust_bar_items: toArray(
      merged.trust_bar_items || merged.trustBarItems,
      storeSettingsFallback.trustBarItems,
    ),
    socialLinks:
      safeParseJson(merged.social_links || merged.socialLinks, storeSettingsFallback.socialLinks) ||
      storeSettingsFallback.socialLinks,
    social_links:
      safeParseJson(merged.social_links || merged.socialLinks, storeSettingsFallback.socialLinks) ||
      storeSettingsFallback.socialLinks,
  };
};

export const toStoreSettingsPayload = (settings = {}) => ({
  id: settings.id || 1,
  mode: settings.mode || storeSettingsFallback.mode,
  brand_name: settings.brandName || settings.brand_name || null,
  brand_short_name: settings.brandShortName || settings.brand_short_name || null,
  tagline: settings.tagline || null,
  announcement_text: settings.announcementText || settings.announcement_text || null,
  hero_kicker: settings.heroKicker || settings.hero_kicker || null,
  hero_title: settings.heroTitle || settings.hero_title || null,
  hero_subtitle: settings.heroSubtitle || settings.hero_subtitle || null,
  hero_image: settings.heroImage || settings.hero_image || null,
  hero_secondary_image: settings.heroSecondaryImage || settings.hero_secondary_image || null,
  campaign_image: settings.campaignImage || settings.campaign_image || null,
  contact_email: settings.contactEmail || settings.contact_email || null,
  support_phone: settings.supportPhone || settings.support_phone || null,
  whatsapp_number:
    normalizePhoneNumber(settings.whatsappNumber || settings.whatsapp_number || '') || null,
  instagram_handle: settings.instagramHandle || settings.instagram_handle || null,
  instagram_url: settings.instagramUrl || settings.instagram_url || null,
  address_line: settings.addressLine || settings.address_line || null,
  support_hours: settings.supportHours || settings.support_hours || null,
  trusted_badge_text: settings.trustedBadgeText || settings.trusted_badge_text || null,
  faq_items: toArray(settings.faqItems || settings.faq_items, storeSettingsFallback.faqItems),
  trust_bar_items: toArray(
    settings.trustBarItems || settings.trust_bar_items,
    storeSettingsFallback.trustBarItems,
  ),
  social_links:
    safeParseJson(settings.socialLinks || settings.social_links, storeSettingsFallback.socialLinks) ||
    storeSettingsFallback.socialLinks,
});

export const normalizeOrder = (record = {}) => ({
  ...record,
  id: record.id,
  orderId: record.order_id || record.orderId,
  order_id: record.order_id || record.orderId,
  customerName: record.customer_name || '',
  customer_name: record.customer_name || '',
  customerEmail: record.customer_email || '',
  customer_email: record.customer_email || '',
  customerPhone: record.customer_phone || '',
  customer_phone: record.customer_phone || '',
  customerAddress: record.customer_address || '',
  customer_address: record.customer_address || '',
  customerCity: record.customer_city || '',
  customer_city: record.customer_city || '',
  customerState: record.customer_state || '',
  customer_state: record.customer_state || '',
  customerPincode: record.customer_pincode || '',
  customer_pincode: record.customer_pincode || '',
  items: safeParseJson(record.items, []),
  totalAmount: toNumber(record.total_amount),
  total_amount: toNumber(record.total_amount),
  subtotalAmount: toNumber(record.subtotal_amount, toNumber(record.total_amount)),
  subtotal_amount: toNumber(record.subtotal_amount, toNumber(record.total_amount)),
  shippingAmount: toNumber(record.shipping_amount),
  shipping_amount: toNumber(record.shipping_amount),
  status: record.status || 'New',
  paymentMethod: record.payment_method || 'COD',
  payment_method: record.payment_method || 'COD',
  notes: record.notes || '',
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

export const toOrderPayload = (order = {}) => ({
  order_id: order.orderId || order.order_id,
  customer_name: order.customerName || order.customer_name,
  customer_email: order.customerEmail || order.customer_email || null,
  customer_phone:
    normalizePhoneNumber(order.customerPhone || order.customer_phone || '') || null,
  customer_address: order.customerAddress || order.customer_address || null,
  customer_city: order.customerCity || order.customer_city || null,
  customer_state: order.customerState || order.customer_state || null,
  customer_pincode: order.customerPincode || order.customer_pincode || null,
  items: safeParseJson(order.items, []),
  subtotal_amount: toNumber(order.subtotalAmount || order.subtotal_amount),
  shipping_amount: toNumber(order.shippingAmount || order.shipping_amount),
  total_amount: toNumber(order.totalAmount || order.total_amount),
  status: order.status || 'New',
  payment_method: order.paymentMethod || order.payment_method || 'COD',
  notes: order.notes || null,
});
