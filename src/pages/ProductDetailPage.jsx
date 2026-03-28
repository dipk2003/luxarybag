import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, Shield, RotateCcw, MessageCircle, ShoppingBag, Check, Loader2, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import { Button } from '@/components/ui/button';
import { useMode } from '@/contexts/ModeContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { products, reviews, loading } = useSupabaseData();
  const product = products.find((entry) => entry.slug === slug);
  const { isGrowthMode, settings } = useMode();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [city, setCity] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [embellishment, setEmbellishment] = useState('');

  useEffect(() => {
    setSelectedImage(0);
    setCustomText('');
    setSelectedColor('');
    setEmbellishment('');
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/shop"><Button>Go to Shop</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const productReviews = reviews.filter((review) => review.product_id === product.id);
  const images = product.images || [];

  const handleWhatsAppOrder = () => {
    let message = `Hi, I want to order: ${product.name} | Price: ₹${product.price} | SKU: ${product.sku || 'N/A'}`;

    if (product.is_customizable) {
      if (!customText && !selectedColor) {
        toast({
          title: 'Incomplete Details',
          description: 'Please enter your customization details.',
          variant: 'destructive',
        });
        return;
      }
      message += `\n-- Customization --\nText: ${customText}\nColor: ${selectedColor}\nEmbellishment: ${embellishment}`;
    }

    message += `\nCity: ${city}`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddToCart = () => {
    if (product.is_customizable && (!customText || !selectedColor)) {
      toast({
        title: 'Incomplete Details',
        description: 'Please enter your customization details before adding to cart.',
        variant: 'destructive',
      });
      return;
    }

    addToCart(
      {
        ...product,
        customization: product.is_customizable ? { text: customText, color: selectedColor, embellishment } : null,
      },
      quantity,
    );

    toast({
      title: 'Added to cart!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const trustFeatures = [
    { icon: Truck, text: 'All India Free Delivery' },
    { icon: Shield, text: '100% Quality Check' },
    { icon: RotateCcw, text: 'Easy 7-Day Returns' },
  ];

  return (
    <>
      <Helmet>
        <title>{product.name} - LuxeBag</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen pb-20 md:pb-0">
        <TrustBar />
        <Header />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 text-sm text-gray-600">
            <Link to="/" className="hover:text-yellow-600">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-yellow-600">Shop</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl mb-4 bg-gray-100 shadow-sm border border-gray-100">
                <img className="w-full h-full object-cover" alt={product.name} src={images[selectedImage]} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === index ? 'border-yellow-600 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img className="w-full h-full object-cover" alt={`${product.name} view ${index + 1}`} src={img} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm text-yellow-700 font-bold bg-yellow-50 px-2 py-1 rounded-md uppercase tracking-wider">{product.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500 mb-4">SKU: {product.sku || 'N/A'}</p>

              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600 font-medium">
                  {product.rating} ({product.reviews_count || productReviews.length} reviews)
                </span>
              </div>

              <div className="mb-6 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.original_price > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.original_price.toLocaleString()}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                        -{product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-8 leading-relaxed text-lg">{product.description}</p>

              {product.is_customizable && (
                <div className="bg-yellow-50/50 border border-yellow-100 p-6 rounded-xl mb-8 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="w-5 h-5 text-yellow-700" />
                    <h3 className="text-lg font-bold text-gray-900">Personalize Your Bag</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name / Text on Bag</label>
                    <input
                      type="text"
                      placeholder="e.g., Mrs. Khan, Shweta"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 20 characters.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Base Color</label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none bg-white"
                      >
                        <option value="">Select Color</option>
                        {product.personalization_options?.base_colors?.map((color) => (
                          <option key={color} value={color}>{color}</option>
                        )) || <><option value="Red">Red</option><option value="Black">Black</option><option value="Maroon">Maroon</option></>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Work Type</label>
                      <select
                        value={embellishment}
                        onChange={(e) => setEmbellishment(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none bg-white"
                      >
                        <option value="">Select Type</option>
                        {product.personalization_options?.embellishment_types?.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        )) || <><option value="Gold Zari">Gold Zari</option><option value="Silver Zari">Silver Zari</option></>}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                {product.in_stock ? (
                  <div className="flex items-center text-green-700 bg-green-50 w-fit px-3 py-1 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4 mr-2" />
                    In Stock - Ready to Ship
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold bg-red-50 w-fit px-3 py-1 rounded-full">Out of Stock</div>
                )}
              </div>

              {isGrowthMode && product.in_stock && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 border-gray-300">
                      -
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <Button variant="outline" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 border-gray-300">
                      +
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4 mb-8">
                {isGrowthMode ? (
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                    className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
                    <p className="text-sm font-bold text-green-800 mb-3 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Quick Order via WhatsApp
                    </p>
                    <input
                      type="text"
                      placeholder="Enter your City (Optional)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 mb-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                    <Button
                      onClick={handleWhatsAppOrder}
                      className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg font-bold rounded-lg"
                    >
                      Send Order Request
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6">
                {trustFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                      <feature.icon className="w-5 h-5 text-yellow-700" />
                    </div>
                    <span className="text-gray-900 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-gray-200 pt-10">
            <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productReviews.length > 0 ? productReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic leading-relaxed">"{review.comment}"</p>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center text-yellow-800 font-bold text-xs">
                        {review.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-bold text-sm text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    {review.verified && (
                      <span className="text-[10px] text-green-700 font-bold bg-green-100 px-2 py-1 rounded-full uppercase tracking-wider">Verified</span>
                    )}
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No reviews yet. Be the first to review this beauty!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetailPage;
