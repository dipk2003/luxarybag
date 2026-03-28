import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Download, MessageCircle, Home, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useStore } from '@/contexts/ModeContext';
import { supabase } from '@/lib/customSupabaseClient';
import { normalizeOrder } from '@/modules/shared/utils/normalizers';
import { generateInvoicePDF } from '@/utils/generateInvoicePDF';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const { settings } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) throw error;
        setOrder(normalizeOrder(data));
      } catch (err) {
        console.error('Could not fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (!order) {
      toast({
        title: 'Invoice unavailable',
        description: 'Order details could not be loaded. Please try again later.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const brandName = settings?.brandName || settings?.brand_name || 'LuxeBag';
      generateInvoicePDF(order, brandName);
      toast({
        title: 'Invoice Downloaded',
        description: `Invoice for #${orderId} has been saved.`,
      });
    } catch (err) {
      console.error('Invoice generation failed:', err);
      toast({
        title: 'Download Failed',
        description: 'Something went wrong while generating the invoice.',
        variant: 'destructive',
      });
    }
  };

  const handleWhatsAppUpdate = () => {
    const message = encodeURIComponent(`Hi, I just placed order #${orderId}. Can you please confirm the shipping timeline?`);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for shopping with {settings?.brandShortName || 'LuxeBag'}. Your order <span className="font-bold text-black">#{orderId}</span> has been placed successfully.
          </p>

          <div className="space-y-3 mb-8">
            <Button
              onClick={handleDownloadInvoice}
              variant="outline"
              className="w-full border-dashed"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Loading Order...' : 'Download Invoice'}
            </Button>

            <Button onClick={handleWhatsAppUpdate} className="w-full bg-green-500 hover:bg-green-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Get Updates on WhatsApp
            </Button>
          </div>

          <Link to="/">
            <Button variant="link" className="text-yellow-600">
              <Home className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
