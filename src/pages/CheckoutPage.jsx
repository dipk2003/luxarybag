import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useMode } from '@/contexts/ModeContext';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/modules/orders/orderService';

const generateOrderId = () => `ORD-${Date.now().toString().slice(-6)}`;

const CheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { isGrowthMode } = useMode();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isGrowthMode) {
      toast({
        title: 'Checkout not available',
        description: 'Please contact us on WhatsApp to complete your order.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const orderId = generateOrderId();
      await orderService.create({
        orderId,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        customerCity: formData.city,
        customerState: formData.state,
        customerPincode: formData.pincode,
        items: cart,
        subtotalAmount: cartTotal,
        shippingAmount: 0,
        totalAmount: cartTotal,
        paymentMethod: 'COD',
      });

      toast({
        title: 'Order Placed Successfully!',
        description: `Your Order ID is ${orderId}`,
      });
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      toast({
        title: 'Order Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - LuxeBag</title>
        </Helmet>
        <div className="min-h-screen">
          <Header />
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
            <Button onClick={() => navigate('/shop')} className="bg-yellow-600 hover:bg-yellow-700">
              Continue Shopping
            </Button>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - LuxeBag</title>
      </Helmet>

      <div className="min-h-screen pb-20 md:pb-0">
        <Header />

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img className="w-full h-full object-cover" alt={item.name} src={item.images?.[0]} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{item.name}</h3>
                    <p className="text-lg font-bold text-yellow-600 mb-3">₹{item.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="bg-gray-50 p-6 rounded-xl mb-6">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Delivery</span>
                    <span>FREE</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {isGrowthMode ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email (Optional)"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                  />
                  <textarea
                    placeholder="Full Address"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                    rows="3"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode"
                      required
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-lg">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : 'Place Order (COD)'}
                  </Button>
                </form>
              ) : (
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <p className="mb-4 text-blue-800">Checkout is currently disabled. Please contact us on WhatsApp to order.</p>
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

export default CheckoutPage;
