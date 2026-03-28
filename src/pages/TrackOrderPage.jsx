import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Package } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/modules/orders/orderService';
import { formatCurrency, formatDate } from '@/modules/shared/utils/formatters';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId || !phone) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both Order ID and Phone Number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const order = await orderService.track(orderId, phone);
      if (!order) {
        toast({
          title: 'Order not found',
          description: 'Please check the order ID and phone number.',
          variant: 'destructive',
        });
        setTrackedOrder(null);
        return;
      }
      setTrackedOrder(order);
    } catch (error) {
      toast({
        title: 'Tracking failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Order - LuxeBag</title>
      </Helmet>
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
              <p className="text-gray-600">Enter your order details below to check status</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <form onSubmit={handleTrack} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Order ID</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. ORD-123456"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="Registered Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-600 outline-none"
                  />
                </div>
                <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Track Order
                </Button>
              </form>
            </div>

            {trackedOrder && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 mt-6">
                <p className="text-sm text-gray-500 mb-2">{trackedOrder.order_id}</p>
                <h2 className="text-xl font-bold mb-3">Status: {trackedOrder.status}</h2>
                <p className="text-gray-700 mb-2">Placed on: {formatDate(trackedOrder.created_at)}</p>
                <p className="text-gray-700 mb-2">Total: {formatCurrency(trackedOrder.total_amount)}</p>
                <p className="text-gray-700">Items: {trackedOrder.item_count}</p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TrackOrderPage;
