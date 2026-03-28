insert into public.store_settings (
  id,
  mode,
  brand_name,
  brand_short_name,
  tagline,
  announcement_text,
  hero_kicker,
  hero_title,
  hero_subtitle,
  hero_image,
  hero_secondary_image,
  campaign_image,
  contact_email,
  support_phone,
  whatsapp_number,
  instagram_handle,
  instagram_url,
  address_line,
  support_hours,
  trusted_badge_text,
  faq_items,
  trust_bar_items,
  social_links
)
values (
  1,
  'GROWTH',
  'Aura Maison',
  'Aura',
  'Exquisite handcrafted luxury bags for bridal elegance and refined everyday styling.',
  'Complimentary Express Shipping Worldwide • White-Glove Delivery • 14-Day Privileged Returns',
  'The Opulence Collection',
  'Masterpieces crafted for the extraordinary.',
  'Discover our exclusive selection of artisanal bridal clutches, bespoke gifting edits, and sculpted evening silhouettes.',
  'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80',
  'concierge@auramaison.com',
  '+91 98123 45678',
  '919812345678',
  '@auramaison.official',
  'https://instagram.com/auramaison.official',
  'The Palladium, Luxury Wing, Mumbai 400013',
  'Mon - Sun, 10:00 AM - 9:00 PM',
  '125k+ Global Tastemakers',
  '[
    {"question":"Do you offer worldwide shipping?", "answer":"Yes, we provide complimentary white-glove express delivery internationally."},
    {"question":"Are the materials sustainably sourced?", "answer":"Absolutely. Our ateliers source only the finest, certifiably sustainable exotic leathers and silks."},
    {"question":"Do you offer bespoke customization?", "answer":"Yes, our artisans provide hand-painted monograms and custom hardware finishes."},
    {"question":"What is your return policy?", "answer":"We offer a 14-day privileged return window for all non-bespoke pieces in their original pristine condition."}
  ]'::jsonb,
  array['Complimentary Global Shipping', 'Bespoke Services', 'Lifetime Authenticity Guarantee', 'White-Glove Delivery'],
  '{"instagram":"https://instagram.com/auramaison.official","facebook":"#","twitter":"#"}'::jsonb
)
on conflict (id) do update
set
  mode = excluded.mode,
  brand_name = excluded.brand_name,
  brand_short_name = excluded.brand_short_name,
  tagline = excluded.tagline,
  announcement_text = excluded.announcement_text,
  hero_kicker = excluded.hero_kicker,
  hero_title = excluded.hero_title,
  hero_subtitle = excluded.hero_subtitle,
  hero_image = excluded.hero_image,
  hero_secondary_image = excluded.hero_secondary_image,
  campaign_image = excluded.campaign_image,
  contact_email = excluded.contact_email,
  support_phone = excluded.support_phone,
  whatsapp_number = excluded.whatsapp_number,
  instagram_handle = excluded.instagram_handle,
  instagram_url = excluded.instagram_url,
  address_line = excluded.address_line,
  support_hours = excluded.support_hours,
  trusted_badge_text = excluded.trusted_badge_text,
  faq_items = excluded.faq_items,
  trust_bar_items = excluded.trust_bar_items,
  social_links = excluded.social_links;

insert into public.instagram_settings (id, handle, profile_url, badge_text, gallery)
values (
  1,
  '@auramaison.official',
  'https://instagram.com/auramaison.official',
  '125k+ Global Tastemakers',
  '[
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512201078372-9c6b2a0d528a?auto=format&fit=crop&q=80"
  ]'::jsonb
)
on conflict (id) do update
set
  handle = excluded.handle,
  profile_url = excluded.profile_url,
  badge_text = excluded.badge_text,
  gallery = excluded.gallery;

insert into public.products (
  sku,
  name,
  slug,
  category,
  price,
  original_price,
  discount,
  short_description,
  description,
  rating,
  reviews_count,
  images,
  in_stock,
  featured,
  is_new_arrival,
  is_best_seller,
  is_customizable,
  personalization_options,
  highlights,
  material,
  delivery_note
)
values
(
  'AM-BRD-001',
  'Lumina Crystal Minaudière',
  'lumina-crystal-minaudiere',
  'bridal',
  125000,
  145000,
  13,
  'An opulent crystal-encrusted evening clutch with 24k gold-plated hardware.',
  'An architectural masterpiece destined for grand galas and bridal perfection. Handcrafted by master artisans with over 4,000 faceted crystals.',
  5.0,
  45,
  array[
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512201078372-9c6b2a0d528a?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80'
  ],
  true,
  true,
  true,
  true,
  false,
  '{}'::jsonb,
  array['Authentic Austrian Crystals', '24k Gold-Plated Clasp', 'Silk Faille Lining'],
  'Crystal mesh and brass',
  'Ships in 3-5 business days'
),
(
  'AM-CST-002',
  'Monogram Heritage Tote',
  'monogram-heritage-tote',
  'custom-bags',
  185000,
  185000,
  0,
  'A spacious and structured traveler crafted from supreme grained calfskin.',
  'The quintessential luxury companion. Designed to traverse continents, it features a bespoke hand-painted monogram service to articulate your unique identity.',
  4.9,
  82,
  array[
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80'
  ],
  true,
  true,
  true,
  false,
  true,
  '{"base_colors":["Onyx","Sable","Ivory","Emerald"],"embellishment_types":["Hand-Painted Initials","Gold Foil Monogram"]}'::jsonb,
  array['Full-grain calfskin', 'Palladium hardware', 'Complimentary monogramming'],
  'Italian Grained Calfskin',
  'Custom dispatch in 7-10 days'
),
(
  'AM-PRT-003',
  'Stellar Micro Bijou',
  'stellar-micro-bijou',
  'party',
  85000,
  95000,
  10,
  'A striking microscopic jewel box bag adorned with brilliant-cut embellishments.',
  'More than an accessory, it is a piece of jewelry. A scintillating companion that holds only the absolute essentials while capturing every gaze in the room.',
  4.8,
  36,
  array[
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512201078372-9c6b2a0d528a?auto=format&fit=crop&q=80'
  ],
  true,
  true,
  false,
  true,
  false,
  '{}'::jsonb,
  array['Jewelry-grade craftsmanship', 'Mirrored obsidian finish', 'Removable snake chain'],
  'Palladium and enamel',
  'Ships in 3-5 business days'
),
(
  'AM-WED-004',
  'Versailles Trousseau Trunk',
  'versailles-trousseau-trunk',
  'wedding',
  450000,
  450000,
  0,
  'A breathtaking miniature trunk designed for heritage gifting and heirloom curation.',
  'Inspired by royal French courts, this structured trunk features intricate marquetry and velvet interiors designed to pass down through generations.',
  5.0,
  12,
  array[
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80'
  ],
  true,
  false,
  true,
  false,
  false,
  '{}'::jsonb,
  array['Heirloom quality', 'Bespoke velvet interior', 'Solid brass lock'],
  'Saffiano leather and brass',
  'Ships in 10-14 days'
),
(
  'AM-BRD-005',
  'Akoya Pearl Minaudière',
  'akoya-pearl-minaudiere',
  'bridal',
  115000,
  130000,
  11,
  'An ethereal clutch woven entirely from lustrous cultured freshwater pearls.',
  'An exquisite statement of purity and romance, meticulously hand-wired with magnificent pearls to complement the most divine couture finishes.',
  4.7,
  29,
  array[
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80'
  ],
  true,
  false,
  false,
  false,
  false,
  '{}'::jsonb,
  array['Cultured Akoya pearls', 'Satin-lined interior', 'Invisible magnetic closure'],
  'Freshwater pearls',
  'Ships in 3-5 business days'
)
on conflict (slug) do update
set
  sku = excluded.sku,
  name = excluded.name,
  category = excluded.category,
  price = excluded.price,
  original_price = excluded.original_price,
  discount = excluded.discount,
  short_description = excluded.short_description,
  description = excluded.description,
  rating = excluded.rating,
  reviews_count = excluded.reviews_count,
  images = excluded.images,
  in_stock = excluded.in_stock,
  featured = excluded.featured,
  is_new_arrival = excluded.is_new_arrival,
  is_best_seller = excluded.is_best_seller,
  is_customizable = excluded.is_customizable,
  personalization_options = excluded.personalization_options,
  highlights = excluded.highlights,
  material = excluded.material,
  delivery_note = excluded.delivery_note;

insert into public.reviews (product_id, name, rating, comment, verified)
select p.id, 'Eleanor V.', 5, 'The craftsmanship is phenomenal. The crystals catch the light beautifully in person. Worth every penny for our black-tie event.', true
from public.products p
where p.slug = 'lumina-crystal-minaudiere'
on conflict do nothing;

insert into public.reviews (product_id, name, rating, comment, verified)
select p.id, 'Sophia M.', 5, 'My monogrammed tote is exquisite. The leather quality rivals the top Paris houses, and the painting is flawless.', true
from public.products p
where p.slug = 'monogram-heritage-tote'
on conflict do nothing;

insert into public.reviews (product_id, name, rating, comment, verified)
select p.id, 'Isabella R.', 4, 'A stunning little piece. It only holds a lipstick and a card, but it makes an incredible statement.', true
from public.products p
where p.slug = 'stellar-micro-bijou'
on conflict do nothing;

insert into public.blog_posts (
  title,
  slug,
  excerpt,
  meta_description,
  content,
  featured_image,
  category,
  published,
  read_time
)
values
(
  'The Masterclass: Curating the Ultimate Bridal Trousseau',
  'curating-the-ultimate-bridal-trousseau',
  'An exclusive guide to building an heirloom-worthy collection of luxury bags for your multi-day celebration.',
  'Discover expert curation strategies for selecting bridal bags and minaudieres for every grand event.',
  'The modern bride’s trousseau requires more than sheer numbers; it demands an articulated vision of luxury and heirloom potential. For grand receptions, the Lumina Crystal Minaudière offers structural brilliance that reflects flash photography beautifully. Daytime affairs call for the softness of the Akoya Pearl piece. Most importantly, a Trousseau Trunk acts not just as an accessory, but as the quintessential vault for your precious belongings on the most important days of your life. Invest in timelessness over trends.',
  'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80',
  'Style',
  true,
  '5 min read'
),
(
  'Behind the Atelier: The Art of Bespoke Monogramming',
  'the-art-of-bespoke-monogramming',
  'How our master artisans hand-paint your legacy onto world-class calfskin.',
  'Explore the meticulous process behind our bespoke monogramming service and custom luxury bags.',
  'A monogram should never be an afterthought; it is the crest of your personal legacy. In our Paris and Milan ateliers, artisans apply up to six layers of specialized pigment to seamlessly integrate your initials onto our Italian grained calfskin. The result is a vibrant, durable insignia that will not peel or fade over decades of use. True luxury is not just what you carry, but the story that it tells about who you are.',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80',
  'Atelier',
  true,
  '4 min read'
)
on conflict (slug) do update
set
  title = excluded.title,
  excerpt = excluded.excerpt,
  meta_description = excluded.meta_description,
  content = excluded.content,
  featured_image = excluded.featured_image,
  category = excluded.category,
  published = excluded.published,
  read_time = excluded.read_time;

-- After creating an admin user in Supabase Auth, either:
-- 1. Set raw_app_meta_data.role = 'admin' for that user, then rerun supabase/schema.sql
-- 2. Or run supabase/fix-admin-access.sql once
